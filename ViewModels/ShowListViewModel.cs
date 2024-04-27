using AM4.Desafios.ToDoList.Models;

namespace AM4.Desafios.ToDoList.ViewModels;

public class ShowListViewModel 
{
    public int SelectedListId { get; set; }

    public Lista? SelectedList { get; set; }

    public List<Lista> Listas { get; set; } = new List<Lista>();
}