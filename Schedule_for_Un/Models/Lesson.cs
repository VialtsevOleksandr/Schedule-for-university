using System;
using System.Collections.Generic;

namespace Schedule_for_Un.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public Group? Group { get; set; } 
        public int TeacherId { get; set; }
        public Teacher? Teacher { get; set; }
        public int Date { get; set; }
        public int NumberOfPair { get; set; }
        public string Subject { get; set; } = null!;
        public bool IsLecture { get; set; }
        
    }
}