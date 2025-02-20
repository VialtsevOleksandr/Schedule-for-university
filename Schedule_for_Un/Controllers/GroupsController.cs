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
    public class GroupsController : ControllerBase
    {
        private readonly ScheduleAPIContext _context;
        public GroupsController(ScheduleAPIContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
        {
            return await _context.Groups.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Group>> GetGroup(int id)
        {
            var group = await _context.Groups.FindAsync(id);

            if (group == null)
            {
                return NotFound();
            }

            return group;
        }

        [HttpGet("similar-groups")]
        public async Task<ActionResult<IEnumerable<Group>>> GetSimilarGroups(string specialty, byte course, byte day, byte pair)
        {
            var similarGroups = await _context.Groups
                .Where(g => g.Specialty == specialty && g.Course == course && !_context.Lessons.Any(l => l.Day == day && l.NumberOfPair == pair && l.GroupLessons.Any(gl => gl.GroupId == g.Id)))
                .ToListAsync();

            if (similarGroups == null || similarGroups.Count == 0)
            {
                return NotFound();
            }

            return similarGroups;
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutGroup(int id, Group group)
        {
            if (id != group.Id)
            {
                return BadRequest();
            }

            if (_context.Groups.Any(g => g.Name.ToLower() == group.Name.ToLower() && g.Id != group.Id))
            {
                return BadRequest(new { message = "Група з таким ім'ям вже існує" });
            }

            _context.Entry(group).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!GroupExists(id))
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
        public async Task<ActionResult<Group>> PostGroup(Group group)
        {
            if (_context.Groups.Any(g => g.Name.ToLower() == group.Name.ToLower()))
            {
                return BadRequest(new { message = "Група з таким ім'ям вже існує" });
            }

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetGroup", new { id = group.Id }, group);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Group>> DeleteGroup(int id)
        {
            var group = await _context.Groups.FindAsync(id);
            if (group == null)
            {
                return NotFound();
            }
            if (_context.GroupLessons.Any(gl => gl.GroupId == id))
            {
                return BadRequest(new { message = "Неможливо видалити групу, оскільки вона має заняття" });
            }
            
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();

            return group;
        }
        private bool GroupExists(int id)
        {
            return _context.Groups.Any(e => e.Id == id);
        }
    }
}