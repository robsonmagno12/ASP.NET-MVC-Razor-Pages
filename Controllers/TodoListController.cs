using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using AM4.Desafios.ToDoList.Data;
using AM4.Desafios.ToDoList.Models;
using AM4.Desafios.ToDoList.ViewModels;


namespace AM4.Desafios.ToDoList.Controllers;

public class TodoListController : Controller
{

    private readonly AppDbContext _context;

    public TodoListController(AppDbContext context) => _context = context;


    public IActionResult Index(string search, int listSelectedId)
    {
        var lista = new Lista();
        TempData["listSelectedId"] = listSelectedId;
        var userId = lista.UserId;

        var listas = _context.Listas
            .Where(l => l.UserId == userId)
            .OrderBy(l => l.Id)
            .Include(l => l.Tarefas)
            .AsNoTracking();


        var listasFiltradas = listas
                .Where(l => search == null || l.Title.ToLower().Contains(search.ToLower()))
                .Where(l => l.Id != listSelectedId)
                .ToList();

        if (!string.IsNullOrEmpty(search))
        {
            listas.Where(t => t.Title.Contains(search.ToLower()));
        }

      

        var selectedLista = listas.FirstOrDefault(l => l.Id == listSelectedId);

        if (selectedLista != null)
        {
            listasFiltradas = listasFiltradas.Where(l => l.Id != selectedLista.Id).ToList();
            listasFiltradas.Insert(0, selectedLista);
        }

        var showListViewModel = new ShowListViewModel
        {
            Listas = listasFiltradas,
            SelectedListId = listSelectedId,
            SelectedList = selectedLista
        };

        return View(showListViewModel);
    }

    public IActionResult CreateList(Lista record)
    {
        if (ModelState.IsValid)
        {
            var lista = new Lista();
            var userId = lista.UserId;
            record.UserId = userId;
            _context.Listas.Add(record);
            _context.SaveChanges();
        }

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = record.Id });
    }

    public IActionResult DeleteList(int selectedListId)
    {
        var list = _context.Listas.Find(selectedListId);

        if (list != null)
        {
            _context.Listas.Remove(list);
            _context.SaveChanges();
        }

        return RedirectToAction("Index");
    }

    public IActionResult CreateTask(Tarefa record, int selectedListId)
    {
        if (ModelState.IsValid && selectedListId != 0)
        {
            record.ListaId = selectedListId;
            _context.Tarefas.Update(record);
            _context.SaveChanges();
        }

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }

    public IActionResult EditTask(Tarefa record, int taskId, int selectedListId)
    {
        var tarefa = _context.Tarefas.Find(taskId);

        if (tarefa != null)
        {
            tarefa.Title = record.Title ?? tarefa.Title;
            tarefa.Description = record.Description;
            tarefa.Done = record.Done;
            _context.SaveChanges();
        }

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }

    public IActionResult RemoveTask(int taskId, int selectedListId)
    {
        var tarefa = _context.Tarefas.Find(taskId);


        if (tarefa != null)
        {
            _context.Tarefas.Remove(tarefa);
            _context.SaveChanges();
        }

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }

    public IActionResult EditList(Lista record)
    {

        var lista = _context.Listas.FirstOrDefault(l => l.Id == record.Id);


        if (lista != null)
        {
            lista.Title = record.Title;
            lista.Tarefas = record.Tarefas;
            _context.SaveChanges();
        }

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = record.Id });
    }

    public IActionResult OpenModalLista(int? selectedListId, bool isCreation = false)
    {
        TempData["OpenModalLista"] = true;
        TempData["OpenModalIsCreation"] = isCreation;

        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }

    public IActionResult OpenModalTarefa(int selectedListId)
    {
        TempData["OpenModalTarefa"] = true;
        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }


    public IActionResult CloseModal(int selectedListId)
    {
        TempData["OpenModalLista"] = false;
        TempData["OpenModalTarefa"] = false;
        return RedirectToAction("Index", "ToDoList", new { listSelectedId = selectedListId });
    }

}