using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Schedule_for_Un.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace Schedule_for_Un.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonsController : ControllerBase
    {
        private readonly ScheduleAPIContext _context;
        public LessonsController(ScheduleAPIContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetLessons()
        {
            return await _context.Lessons.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Lesson>> GetLesson(int id)
        {
            var lesson = await _context.Lessons
                .Include(l => l.TeacherLessons)
                .Include(l => l.GroupLessons)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lesson == null)
            {
                return NotFound();
            }

            return lesson;
        }
        [HttpGet("lesson-course/{course}")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetLessonsByCourse(byte course)
        {
            var lessons = await _context.Lessons
                .Include(l => l.TeacherLessons)
                    .ThenInclude(tl => tl.Teacher)
                .Include(l => l.GroupLessons)
                .Where(l => l.GroupLessons.Any(gl => gl.Group!.Course == course))
                .ToListAsync();

            if (lessons == null || !lessons.Any())
            {
                return NotFound();
            }

            return lessons;
        }

        public class LessonUpdateDto
        {
            public string Subject { get; set; } = string.Empty;
            public byte HoursOfSubject { get; set; }
            public bool HaveConsultation { get; set; }
            public byte? HoursOfConsultation { get; set; }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> PutLesson(int id, LessonUpdateDto lessonUpdateDto)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }

            lesson.Subject = lessonUpdateDto.Subject;
            lesson.HoursOfSubject = lessonUpdateDto.HoursOfSubject;
            lesson.HaveConsultation = lessonUpdateDto.HaveConsultation;
            lesson.HoursOfConsultation = lessonUpdateDto.HoursOfConsultation;

            _context.Entry(lesson).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LessonExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Lesson>> DeleteLesson(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var lesson = await _context.Lessons.FindAsync(id);
                if (lesson == null)
                {
                    return NotFound();
                }

                var groupLessons = await _context.GroupLessons
                    .Where(gl => gl.LessonId == id)
                    .ToListAsync();
                
                var teacherLessons = await _context.TeacherLessons
                    .Where(tl => tl.LessonId == id)
                    .ToListAsync();
                
                foreach (var teacherId in teacherLessons.Select(tl => tl.TeacherId))
                {
                    var teacherFreeHours = _context.FreeHours
                        .Where(fh => fh.TeacherId == teacherId && fh.LessonId == id)
                        .ToList();
                    foreach (var teacherFreeHour in teacherFreeHours)
                    {
                        teacherFreeHour.IsFree = true;
                        teacherFreeHour.LessonId = null;
                    }
                    await _context.SaveChangesAsync();
                }

                _context.GroupLessons.RemoveRange(groupLessons);
                _context.TeacherLessons.RemoveRange(teacherLessons);

                _context.Lessons.Remove(lesson);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return lesson;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        private bool LessonExists(int id)
        {
            return _context.Lessons.Any(e => e.Id == id);
        }

        public class LessonWithDetails
        {
            public Lesson Lesson { get; set; } = null!;
            public List<int> TeacherIds { get; set; } = new List<int>();
            public List<int> GroupIds { get; set; } = new List<int>();
        }

        [HttpPost("with-details")]
        public async Task<ActionResult<Lesson>> PostLessonWithDetails([FromBody] LessonWithDetails lessonWithDetails)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var lesson = lessonWithDetails.Lesson;
                var teacherIds = lessonWithDetails.TeacherIds;
                var groupIds = lessonWithDetails.GroupIds;

                if (lesson == null || teacherIds == null || groupIds == null)
                {
                    return BadRequest();
                }
                if (teacherIds.Count == 0 || groupIds.Count == 0)
                {
                    return BadRequest(new { message = "Не вказано викладачів або групи" });
                }

                var conflictingGroup = _context.Lessons
                    .Where(l => l.GroupLessons.Any(gl => groupIds.Contains(gl.GroupId)) && l.Day == lesson.Day && l.NumberOfPair == lesson.NumberOfPair)
                    .SelectMany(l => l.GroupLessons)
                    .FirstOrDefault(gl => groupIds.Contains(gl.GroupId));

                if (conflictingGroup != null)
                {
                    var groupName = _context.Groups.Find(conflictingGroup.GroupId)?.Name;
                    return BadRequest(new { message = $"На цей час та день у групи {groupName} вже є заняття" });
                }

                if (lesson.HaveConsultation && lesson.HoursOfConsultation == null)
                {
                    return BadRequest(new { message = "Не вказано кількість годин консультацій" });
                }

                _context.Lessons.Add(lesson);
                await _context.SaveChangesAsync();

                var groupLessons = groupIds.Select(groupId => new GroupLesson
                {
                    LessonId = lesson.Id,
                    GroupId = groupId
                }).ToList();

                var teacherLessons = teacherIds.Select(teacherId => new TeacherLesson
                {
                    LessonId = lesson.Id,
                    TeacherId = teacherId
                }).ToList();

                _context.GroupLessons.AddRange(groupLessons);
                _context.TeacherLessons.AddRange(teacherLessons);
                await _context.SaveChangesAsync();

                var teacherFreeHours = _context.FreeHours
                    .Where(fh => teacherIds.Contains(fh.TeacherId) && fh.Day == lesson.Day && fh.NumberOfPair == lesson.NumberOfPair)
                    .ToList();
                
                foreach (var teacherFreeHour in teacherFreeHours)
                {
                    teacherFreeHour.IsFree = false;
                    teacherFreeHour.LessonId = lesson.Id;
                }
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(nameof(GetLesson), new { id = lesson.Id }, lesson);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}