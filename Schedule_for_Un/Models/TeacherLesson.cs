using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class TeacherLesson
    {
        public int TeacherId { get; set; }
        public Teacher? Teacher { get; set; }
        public int LessonId { get; set; }
        public Lesson? Lesson { get; set; }
    }
}