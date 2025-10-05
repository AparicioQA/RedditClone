using Microsoft.EntityFrameworkCore;
using RedditClone.API.Models;

namespace RedditClone.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Subreddit> Subreddits { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Vote> Votes { get; set; }
    public DbSet<SubredditMember> SubredditMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Subreddit configuration
        modelBuilder.Entity<Subreddit>()
            .HasIndex(s => s.Name)
            .IsUnique();

        modelBuilder.Entity<Subreddit>()
            .HasOne(s => s.Creator)
            .WithMany(u => u.CreatedSubreddits)
            .HasForeignKey(s => s.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Post configuration
        modelBuilder.Entity<Post>()
            .HasOne(p => p.Author)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Post>()
            .HasOne(p => p.Subreddit)
            .WithMany(s => s.Posts)
            .HasForeignKey(p => p.SubredditId)
            .OnDelete(DeleteBehavior.Cascade);

        // Comment configuration
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        // Vote configuration
        modelBuilder.Entity<Vote>()
            .HasOne(v => v.User)
            .WithMany(u => u.Votes)
            .HasForeignKey(v => v.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Post)
            .WithMany(p => p.Votes)
            .HasForeignKey(v => v.PostId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Vote>()
            .HasOne(v => v.Comment)
            .WithMany(c => c.Votes)
            .HasForeignKey(v => v.CommentId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubredditMember configuration (many-to-many)
        modelBuilder.Entity<SubredditMember>()
            .HasKey(sm => new { sm.SubredditId, sm.UserId });

        modelBuilder.Entity<SubredditMember>()
            .HasOne(sm => sm.Subreddit)
            .WithMany(s => s.Members)
            .HasForeignKey(sm => sm.SubredditId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SubredditMember>()
            .HasOne(sm => sm.User)
            .WithMany(u => u.SubredditMemberships)
            .HasForeignKey(sm => sm.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
