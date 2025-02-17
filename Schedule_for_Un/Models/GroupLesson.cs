using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Schedule_for_Un.Models
{
    public class GroupLesson
    {
        public int GroupId { get; set; }

        [JsonIgnore]
        public Group? Group { get; set; }
        public int LessonId { get; set; }
        
        [JsonIgnore]
        public Lesson? Lesson { get; set; }
    }
}