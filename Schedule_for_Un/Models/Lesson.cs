using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Schedule_for_Un.Models
{
    public class Lesson
    {
        public int Id { get; set; }
        public byte Day { get; set; }
        public byte NumberOfPair { get; set; }
        public string Subject { get; set; } = null!;
        public byte HoursOfSubject { get; set; }
        public byte? HoursOfConsultation { get; set; }
        public bool HaveConsultation { get; set; }
        public bool IsLecture { get; set; }
        public bool? IsEvenWeek { get; set; }
        public virtual ICollection<GroupLesson> GroupLessons { get; set; } = new List<GroupLesson>();
        public virtual ICollection<TeacherLesson> TeacherLessons { get; set; } = new List<TeacherLesson>();

        [JsonIgnore]
        public virtual ICollection<FreeHour> FreeHours { get; set; } = new List<FreeHour>();
        
    }
}