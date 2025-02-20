using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Schedule_for_Un.Models
{
    public class TeacherLesson
    {
        public int TeacherId { get; set; }
        public Teacher? Teacher { get; set; }
        public int LessonId { get; set; }

        [JsonIgnore]
        public Lesson? Lesson { get; set; }
    }
}