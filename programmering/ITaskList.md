---
id: p1
num: P1
title: Implementer ITaskList
points: 20p
subtitle: interface · enum · encapsulation · generics
conceptLabel: Konseptene
---

## Konsept

Denne oppgaven trener deg i å **implementere et interface**. Du får kontrakten, du skal fylle den. Du trener også på **encapsulation** (beskytt intern tilstand), **enum** (avgrenset verdimengde), **exceptions** (avvis ugyldig input) og **hjelpemetoder** (bryt opp logikken).

## Oppgave

Du er gitt tre filer. Du skal lage `TaskList.java` som implementerer `ITaskList`.

## Filer

### Priority.java

```java
public enum Priority { LOW, MEDIUM, HIGH }
```

### ITaskList.java

```java
/**
 * En liste over gjøremål med prioritet.
 * Listen tillater ikke duplikate oppgavenavn.
 */
public interface ITaskList {

    /**
     * Legger til en ny oppgave.
     * @throws IllegalArgumentException hvis name er blank eller allerede finnes
     */
    void addTask(String name, Priority priority);

    /**
     * Markerer oppgaven som fullført.
     * @throws IllegalArgumentException hvis name ikke finnes
     */
    void complete(String name);

    /** Returnerer antall fullførte oppgaver. */
    int countCompleted();

    /**
     * Returnerer en liste over oppgaver med gitt prioritet.
     * Rekkefølge er ikke spesifisert. Returnerer tom liste hvis ingen.
     */
    List<String> getByPriority(Priority priority);

    /**
     * Returnerer alle oppgavenavn sortert alfabetisk.
     */
    List<String> getAllSorted();
}
```

### Main.java

```java
public class Main {
    public static void main(String[] args) {
        ITaskList tasks = new TaskList();
        tasks.addTask("Les kapittel 5", Priority.HIGH);
        tasks.addTask("Gjør lab 3", Priority.HIGH);
        tasks.addTask("Sov", Priority.LOW);
        tasks.complete("Sov");

        System.out.println(tasks.countCompleted());   // → 1
        System.out.println(tasks.getByPriority(Priority.HIGH)); // → [Les kapittel 5, Gjør lab 3]
        System.out.println(tasks.getAllSorted());    // → [Gjør lab 3, Les kapittel 5, Sov]
    }
}
```

## Hint

Du får poeng for: korrekt funksjonalitet, gode variabelnavn, hjelpemetoder der det passer, og riktig encapsulation. Feil syntax trekker lite, rett tankegang vektes mer.

## Fasit

### Løsningsforslag — TaskList.java

```java
import java.util.*;

public class TaskList implements ITaskList {

    // Intern post-klasse — ikke eksponert utenfor
    private record Task(String name, Priority priority, boolean completed) {}

    private final List<Task> tasks = new ArrayList<>();

    @Override
    public void addTask(String name, Priority priority) {
        validateName(name);
        if (findTask(name) != null)
            throw new IllegalArgumentException("Oppgave finnes allerede: " + name);
        tasks.add(new Task(name, priority, false));
    }

    @Override
    public void complete(String name) {
        Task existing = findTask(name);
        if (existing == null)
            throw new IllegalArgumentException("Fant ikke: " + name);
        tasks.remove(existing);
        tasks.add(new Task(existing.name(), existing.priority(), true));
    }

    @Override
    public int countCompleted() {
        return (int) tasks.stream()
            .filter(Task::completed)
            .count();
    }

    @Override
    public List<String> getByPriority(Priority priority) {
        return tasks.stream()
            .filter(t -> t.priority() == priority)
            .map(Task::name)
            .toList();
    }

    @Override
    public List<String> getAllSorted() {
        return tasks.stream()
            .map(Task::name)
            .sorted()
            .toList();
    }

    // --- Hjelpemetoder ---

    private Task findTask(String name) {
        return tasks.stream()
            .filter(t -> t.name().equals(name))
            .findFirst()
            .orElse(null);
    }

    private void validateName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Navn kan ikke være blankt");
    }
}
```

**Hva sensor ser etter:** private felt (encapsulation), IllegalArgumentException på ugyldig input, hjelpemetoder (findTask, validateName), korrekte returtyper, meningsfull navngivning.
