using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class FreeHour
    {
        public int Id { get; set; }
        public int Day { get; set; }
        public int NumberOfPair { get; set; }
        public int TeacherId { get; set; }
        public Teacher? Teacher { get; set; } 
    }
}