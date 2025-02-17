using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Schedule_for_Un.Models
{
    public class FreeHour
    {
        public int Id { get; set; }
        public byte Day { get; set; }
        public byte NumberOfPair { get; set; }
        public bool IsFree { get; set; } // true - нема пари(вільна), false - є пара(зайнята)
        public int TeacherId { get; set; }

        [JsonIgnore]
        public Teacher? Teacher { get; set; } 
        public int? LessonId { get; set; }
        
        [JsonIgnore]
        public Lesson? Lesson { get; set; }
    }
}