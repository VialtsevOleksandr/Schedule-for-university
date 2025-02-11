using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class Teacher
    {
        public int Id { get; set; }
        public string FullName { get; set; } = null!;
        public string Position { get; set; } = null!;
        public virtual ICollection<FreeHour> FreeHours { get; set; } = new List<FreeHour>();
        public virtual ICollection<TeacherLesson> TeacherLessons { get; set; } = new List<TeacherLesson>();
    }
}