using Microsoft.EntityFrameworkCore;

namespace Schedule_for_Un.Models;

public class ScheduleAPIContext : DbContext
{
    public DbSet<FreeHour> FreeHours { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupLesson> GroupLessons { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<TeacherLesson> TeacherLessons { get; set; }
    public ScheduleAPIContext(DbContextOptions<ScheduleAPIContext> options) : base(options)
    {
        Database.EnsureCreated();
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FreeHour>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Day).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.NumberOfPair).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.IsFree).IsRequired();
            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.FreeHours)
                .HasForeignKey(e => e.LessonId)
                .HasConstraintName("FK_FreeHours_Lessons");
            entity.HasOne(e => e.Teacher)
                .WithMany(t => t.FreeHours)
                .HasForeignKey(e => e.TeacherId)
                .HasConstraintName("FK_FreeHours_Teachers");
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasColumnType("nvarchar(100)");
            entity.Property(e => e.Position).IsRequired().HasColumnType("nvarchar(50)");
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasColumnType("nvarchar(50)");
            entity.Property(e => e.Course).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.Specialty).IsRequired().HasColumnType("nvarchar(50)");
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Day).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.NumberOfPair).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.Subject).IsRequired().HasColumnType("nvarchar(50)");
            entity.Property(e => e.HoursOfSubject).IsRequired().HasColumnType("tinyint");
            entity.Property(e => e.HoursOfConsultation).HasColumnType("tinyint").IsRequired(false);
            entity.Property(e => e.HaveConsultation).IsRequired().HasColumnType("bit");
            entity.Property(e => e.IsLecture).IsRequired().HasColumnType("bit");
            entity.Property(e => e.IsEvenWeek).HasColumnType("bit");
        });

        modelBuilder.Entity<TeacherLesson>(entity => 
        {
            entity.HasKey(e => new { e.TeacherId, e.LessonId });
            entity.HasOne(e => e.Teacher)
                .WithMany(t => t.TeacherLessons)
                .HasForeignKey(e => e.TeacherId)
                .HasConstraintName("FK_TeacherLessons_Teachers");
            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.TeacherLessons)
                .HasForeignKey(e => e.LessonId)
                .HasConstraintName("FK_TeacherLessons_Lessons");
        });
        modelBuilder.Entity<GroupLesson>(entity => 
        {
            entity.HasKey(e => new { e.GroupId, e.LessonId });
            entity.HasOne(e => e.Group)
                .WithMany(g => g.GroupLessons)
                .HasForeignKey(e => e.GroupId)
                .HasConstraintName("FK_GroupLessons_Groups");
            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.GroupLessons)
                .HasForeignKey(e => e.LessonId)
                .HasConstraintName("FK_GroupLessons_Lessons");
        });
    }
}