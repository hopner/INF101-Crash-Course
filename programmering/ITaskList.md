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

Du får poeng for: korrekt funksjonalitet, gode variabelnavn, hjelpemetoder der det passer, og riktig innkapsling. Feil syntaks trekker lite om noe, rett tankegang vektes mer.

## Fasit

### Løsningsforslag — TaskList.java

```java
import java.util.*;

public class TaskList implements ITaskList {

    // Intern klasse
    private record Task(String name, Priority priority, boolean completed) {}

    private final List<Task> tasks = new ArrayList<>();

    @Override
    public void addTask(String name, Priority priority) {
        validateName(name);
        validatePriority(priority);
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
        int count = 0;
        for (Task t : tasks) {
            if (t.completed())
                count++;
        }
        return count;
    }

    @Override
    public List<String> getByPriority(Priority priority) {
        validatePriority(priority);
        List<String> result = new ArrayList<>();
        for (Task t : tasks) {
            if (t.priority() == priority)
                result.add(t.name());
        }
        return result;
    }

    @Override
    public List<String> getAllSorted() {
        List<String> copy = new ArrayList<>(tasks);
        Collections.sort(copy, new Comparator<Task>() {
            @Override
            public int compare(Task t1, Task t2) {
                return t1.name().compareTo(t2.name());
            }
        });
        List<String> result = new ArrayList<>();
        for (Task t : copy) {
            result.add(t.name());
        }
        return result;
    }

    // --- Hjelpemetoder ---

    private Task findTask(String name) {
        for (Task t : tasks) {
            if (t.name().equals(name))
                return t;
        }
        return null;
    }

    private void validateName(String name) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Navn kan ikke være blankt");
    }

    private void validatePriority(Priority priority) {
        if (priority == null)
            throw new IllegalArgumentException("Prioritet kan ikke være null");
    }
}
```

**Hva sensor ser etter:** God inkapsling, kodestil, selvdokumenterende kode, og at alle krav i kontrakten er oppfylt. Hjelpemetoder for å unngå duplisering og forbedre lesbarhet. Riktig bruk av enum og exceptions.
