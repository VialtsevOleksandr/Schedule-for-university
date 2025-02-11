using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class GroupLesson
    {
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        public int LessonId { get; set; }
        public Lesson? Lesson { get; set; }
    }
}