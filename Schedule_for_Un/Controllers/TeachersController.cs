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
    public class TeachersController : ControllerBase
    {
        private readonly ScheduleAPIContext _context;
        public TeachersController(ScheduleAPIContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Teacher>>> GetTeachers()
        {
            return await _context.Teachers.ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Teacher>> GetTeacher(int id)
        {
            var teacher = await _context.Teachers.FindAsync(id);

            if (teacher == null)
            {
            return NotFound();
            }

            return teacher;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutTeacher(int id, Teacher teacher)
        {
            if (id != teacher.Id)
            {
            return BadRequest();
            }

            if (_context.Teachers.Any(t => t.FullName.ToLower() == teacher.FullName.ToLower() && t.Id != teacher.Id))
            {
            return BadRequest(new { message = "Викладач з таким ПІБ вже існує" });
            }

            _context.Entry(teacher).State = EntityState.Modified;

            try
            {
            await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
            if (!TeacherExists(id))
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

        [HttpPost]
        public async Task<ActionResult<Teacher>> PostTeacher(Teacher teacher)
        {
            if (_context.Teachers.Any(t => t.FullName.ToLower() == teacher.FullName.ToLower()))
            {
            return BadRequest(new { message = "Викладач з таким ПІБ вже існує" });
            }

            _context.Teachers.Add(teacher);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetTeacher", new { id = teacher.Id }, teacher);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Teacher>> DeleteTeacher(int id)
        {
            var teacher = await _context.Teachers.FindAsync(id);
            if (teacher == null)
            {
            return NotFound();
            }

            if (_context.TeacherLessons.Any(tl => tl.TeacherId == id))
            {
            return BadRequest(new { message = "Неможливо видалити викладача, оскільки він має заняття" });
            }

            _context.FreeHours.RemoveRange(_context.FreeHours.Where(fh => fh.TeacherId == id));
            await _context.SaveChangesAsync();

            _context.Teachers.Remove(teacher);
            await _context.SaveChangesAsync();

            return teacher;
        }
        private bool TeacherExists(int id)
        {
            return _context.Teachers.Any(e => e.Id == id);
        }
    }
}