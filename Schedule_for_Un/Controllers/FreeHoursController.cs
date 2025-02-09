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
    public class FreeHoursController : ControllerBase
    {
        private readonly ScheduleAPIContext _context;
        public FreeHoursController(ScheduleAPIContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FreeHour>>> GetFreeHours()
        {
            return await _context.FreeHours.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FreeHour>> GetFreeHour(int id)
        {
            var freeHour = await _context.FreeHours.FindAsync(id);

            if (freeHour == null)
            {
                return NotFound();
            }

            return freeHour;
        }

        [HttpGet("teacher/{teacherId}")]
        public async Task<ActionResult<IEnumerable<FreeHour>>> GetFreeHoursByTeacherId(int teacherId)
        {
            var freeHours = await _context.FreeHours.Where(fh => fh.TeacherId == teacherId).ToListAsync();

            if (freeHours == null || !freeHours.Any())
            {
            return NotFound();
            }

            return freeHours;
        }

        [HttpPost]
        public async Task<ActionResult<FreeHour>> PostFreeHour(FreeHour freeHour)
        {
            if (_context.FreeHours.Any(fh => fh.Day == freeHour.Day && fh.NumberOfPair == freeHour.NumberOfPair && fh.TeacherId == freeHour.TeacherId))
            {
                return BadRequest(new { message = "Викладач вже має вільний час в цей день та цю годину" });
            }

            freeHour.IsFree = true;

            _context.FreeHours.Add(freeHour);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetFreeHour", new { id = freeHour.Id }, freeHour);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFreeHourIsFree(int id)
        {
            var freeHour = await _context.FreeHours.FindAsync(id);
            if (freeHour == null)
            {
                return NotFound();
            }

            freeHour.IsFree = !freeHour.IsFree;
            _context.Entry(freeHour).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        //доробити видалення
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFreeHour(int id)
        {
            var freeHour = await _context.FreeHours.FindAsync(id);
            if (freeHour == null)
            {
                return NotFound();
            }
            if (freeHour.IsFree == false)
            {
                return BadRequest(new { message = "Неможливо видалити зайнятий час" });
            }
            _context.FreeHours.Remove(freeHour);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}