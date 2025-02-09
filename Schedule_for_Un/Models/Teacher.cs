using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class Teacher
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Position { get; set; } = null!;
        public List<FreeHour> FreeHours { get; set; } = new List<FreeHour>();
        public List<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}