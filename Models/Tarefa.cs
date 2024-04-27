using System.ComponentModel.DataAnnotations;

namespace AM4.Desafios.ToDoList.Models;

public class Tarefa
{
    public int Id { get; set; }

    public int ListaId { get; set; }

    [Required]
    public string Title { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime Estimation { get; set; } = DateTime.Now;

    public bool Done { get; set; }

    public Lista? Lista { get; set; }

}