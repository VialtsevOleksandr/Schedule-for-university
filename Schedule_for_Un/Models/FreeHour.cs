using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class FreeHour
    {
        public int Id { get; set; }
        public byte Day { get; set; }
        public byte NumberOfPair { get; set; }
        public bool IsFree { get; set; } // true - нема пари(вільна), false - є пара(зайнята)
        public int TeacherId { get; set; }
        public Teacher? Teacher { get; set; } 
        public int? LessonId { get; set; }
        public Lesson? Lesson { get; set; }
    }
}