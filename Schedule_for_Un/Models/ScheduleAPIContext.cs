using Microsoft.EntityFrameworkCore;

namespace Schedule_for_Un.Models;

public class ScheduleAPIContext : DbContext
{
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Teacher> Teachers { get; set; }
    public DbSet<FreeHour> FreeHours { get; set; }
    public ScheduleAPIContext(DbContextOptions<ScheduleAPIContext> options) : base(options)
    {
        Database.EnsureCreated();
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FreeHour>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Day).IsRequired();
            entity.Property(e => e.NumberOfPair).IsRequired();
            entity.HasOne(e => e.Teacher)
                .WithMany(t => t.FreeHours)
                .HasForeignKey(e => e.TeacherId);
        });

        modelBuilder.Entity<Teacher>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Fullname).IsRequired().HasColumnType("nvarchar(100)");
            entity.Property(e => e.Position).IsRequired().HasColumnType("nvarchar(50)");
            entity.HasMany(e => e.FreeHours)
                .WithOne(fh => fh.Teacher)
                .HasForeignKey(fh => fh.TeacherId);
            entity.HasMany(e => e.Lessons)
                .WithOne(l => l.Teacher)
                .HasForeignKey(l => l.TeacherId);
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasColumnType("nvarchar(50)");
            entity.Property(e => e.Course).IsRequired();
            entity.Property(e => e.Specialty).IsRequired().HasColumnType("nvarchar(50)");
            entity.HasMany(e => e.Lessons)
                .WithOne(l => l.Group)
                .HasForeignKey(l => l.GroupId);
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Subject).IsRequired().HasColumnType("nvarchar(50)");
            entity.HasOne(e => e.Teacher)
                .WithMany(t => t.Lessons)
                .HasForeignKey(e => e.TeacherId);
            entity.HasOne(e => e.Group)
                .WithMany(g => g.Lessons)
                .HasForeignKey(e => e.GroupId);
        });
    }
}