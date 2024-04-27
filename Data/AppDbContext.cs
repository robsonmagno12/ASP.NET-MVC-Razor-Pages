using AM4.Desafios.ToDoList.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;


namespace AM4.Desafios.ToDoList.Data;

public class AppDbContext : IdentityDbContext<IdentityUser>
{

    public DbSet<Lista> Listas { get; set; }

    public DbSet<Tarefa> Tarefas { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
          => options.UseSqlite("DataSource=app.db;Cache=Shared");


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Lista>()
            .HasKey(l => l.Id);

        modelBuilder.Entity<Lista>()
            .HasMany(l => l.Tarefas)
            .WithOne(t => t.Lista)
            .HasForeignKey(t => t.ListaId)
            .OnDelete(DeleteBehavior.Cascade);
        
        base.OnModelCreating(modelBuilder);
    }

}