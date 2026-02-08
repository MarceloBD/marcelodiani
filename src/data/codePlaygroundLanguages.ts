export interface PlaygroundSnippet {
  label: string;
  code: string;
}

export interface PlaygroundLanguage {
  id: string;
  label: string;
  shortLabel: string;
  pistonRuntime: string;
  browserExecutable: boolean;
  snippets: PlaygroundSnippet[];
}

// ---------------------------------------------------------------------------
// JavaScript
// ---------------------------------------------------------------------------

const JAVASCRIPT_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "Proxy & Reflect",
    code: `const handler = {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number")
      throw new TypeError("age must be number, got " + typeof value);
    console.log("SET " + prop + " = " + JSON.stringify(value));
    return Reflect.set(target, prop, value);
  },
  get(target, prop) {
    console.log("GET " + prop);
    return Reflect.get(target, prop);
  }
};

const user = new Proxy({}, handler);
user.name = "Marcelo";
user.age = 29;
user.skills = ["TypeScript", "React", "AWS"];

console.log(user.name + ", " + user.age + " years");
console.log("Skills: " + user.skills.join(", "));

try { user.age = "thirty"; }
catch (error) { console.log("Caught: " + error.message); }`,
  },
  {
    label: "Async Generators",
    code: `async function* fibonacci(limit) {
  let [a, b] = [0, 1];
  while (a <= limit) {
    yield a;
    [a, b] = [b, a + b];
  }
}

async function* filter(source, predicate) {
  for await (const value of source)
    if (predicate(value)) yield value;
}

const isPrime = n => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
};

console.log("Fibonacci primes up to 10,000:");
const results = [];
for await (const n of filter(fibonacci(10000), isPrime))
  results.push(n);
console.log(results.join(", "));
console.log("Found " + results.length + " fibonacci primes");`,
  },
];

// ---------------------------------------------------------------------------
// TypeScript
// ---------------------------------------------------------------------------

const TYPESCRIPT_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "Discriminated Unions",
    code: `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
    case "triangle": return (shape.base * shape.height) / 2;
  }
}

const shapes: Shape[] = [
  { kind: "circle", radius: 5 },
  { kind: "rectangle", width: 4, height: 6 },
  { kind: "triangle", base: 10, height: 3 },
];

shapes.forEach(shape =>
  console.log(shape.kind + ": area = " + area(shape).toFixed(2))
);

const largest = shapes.reduce((max, shape) =>
  area(shape) > area(max) ? shape : max
);
console.log("Largest: " + largest.kind);`,
  },
  {
    label: "Generic Constraints",
    code: `interface Comparable<T> {
  compareTo(other: T): number;
}

class SortedList<T extends Comparable<T>> {
  private items: T[] = [];

  add(item: T): void {
    const index = this.items.findIndex(
      existing => item.compareTo(existing) < 0
    );
    index === -1
      ? this.items.push(item)
      : this.items.splice(index, 0, item);
  }

  display(): void {
    console.log(this.items.map(String).join(", "));
  }
}

class Temperature implements Comparable<Temperature> {
  constructor(public celsius: number) {}
  compareTo(other: Temperature) {
    return this.celsius - other.celsius;
  }
  toString() { return this.celsius + "\u00B0C"; }
}

const temps = new SortedList<Temperature>();
[30, -5, 22, 8, 100, 15, 0].forEach(
  c => temps.add(new Temperature(c))
);
console.log("Auto-sorted temperatures:");
temps.display();`,
  },
];

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

const PYTHON_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "Decorators",
    code: `from functools import wraps
import time

def memoize(func):
    cache = {}
    @wraps(func)
    def wrapper(*args):
        if args not in cache:
            cache[args] = func(*args)
        return cache[args]
    wrapper.cache = cache
    return wrapper

@memoize
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n - 1) + fibonacci(n - 2)

start = time.perf_counter()
result = fibonacci(100)
ms = (time.perf_counter() - start) * 1000

print(f"fib(100) = {result}")
print(f"Computed in {ms:.3f}ms")
print(f"Cache size: {len(fibonacci.cache)} entries")
print(f"fib(50) = {fibonacci(50)} (instant from cache)")`,
  },
  {
    label: "Generator Pipeline",
    code: `from itertools import islice

def primes():
    """Infinite prime generator (Sieve of Eratosthenes)"""
    composites = {}
    candidate = 2
    while True:
        if candidate not in composites:
            yield candidate
            composites[candidate * candidate] = [candidate]
        else:
            for prime in composites[candidate]:
                composites.setdefault(
                    prime + candidate, []
                ).append(prime)
            del composites[candidate]
        candidate += 1

def twin_primes(source):
    prev = next(source)
    for prime in source:
        if prime - prev == 2:
            yield (prev, prime)
        prev = prime

print("First 10 twin prime pairs:")
for a, b in islice(twin_primes(primes()), 10):
    print(f"  ({a}, {b})")

p100 = next(islice(primes(), 99, 100))
print(f"100th prime: {p100}")`,
  },
];

// ---------------------------------------------------------------------------
// C#
// ---------------------------------------------------------------------------

const CSHARP_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "LINQ & Patterns",
    code: `using System;
using System.Linq;

class Program {
    static string Classify(int age) {
        if (age < 18) return "Junior";
        if (age < 30) return "Rising Star";
        if (age < 50) return "Senior";
        return "Distinguished";
    }

    static void Main() {
        var people = new[] {
            new { Name = "Marcelo", Age = 30, City = "Sao Paulo" },
            new { Name = "Ana", Age = 25, City = "New York" },
            new { Name = "Bob", Age = 45, City = "London" },
            new { Name = "Clara", Age = 17, City = "Tokyo" },
            new { Name = "Dan", Age = 62, City = "Sao Paulo" },
        };

        var grouped = people
            .GroupBy(p => Classify(p.Age))
            .OrderBy(g => g.Key);

        foreach (var group in grouped) {
            Console.WriteLine(group.Key + ":");
            foreach (var p in group)
                Console.WriteLine("  " + p.Name + " (" + p.Age + ", " + p.City + ")");
        }

        Console.WriteLine();
        Console.WriteLine("Avg age: " + people.Average(p => p.Age).ToString("F1"));
        Console.WriteLine("Cities: " + string.Join(", ", people.Select(p => p.City).Distinct()));
    }
}`,
  },
  {
    label: "Iterators & Extensions",
    code: `using System;
using System.Collections.Generic;
using System.Linq;

static class Extensions {
    public static IEnumerable<T> TakeUntil<T>(
        this IEnumerable<T> source, Func<T, bool> stop) {
        foreach (var item in source) {
            yield return item;
            if (stop(item)) yield break;
        }
    }
}

class Program {
    static IEnumerable<long> Fibonacci() {
        long a = 0, b = 1;
        while (true) {
            yield return a;
            long temp = a;
            a = b;
            b = temp + b;
        }
    }

    static void Main() {
        var fibs = Fibonacci()
            .TakeUntil(n => n >= 1000)
            .ToList();

        Console.WriteLine("Fibonacci up to 1000:");
        Console.WriteLine(string.Join(", ", fibs));
        Console.WriteLine("Count: " + fibs.Count);
        Console.WriteLine("Sum: " + fibs.Sum());

        var evens = fibs.Where(n => n % 2 == 0);
        Console.WriteLine("Even: " + string.Join(", ", evens));
    }
}`,
  },
];

// ---------------------------------------------------------------------------
// C
// ---------------------------------------------------------------------------

const C_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "Linked List",
    code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node* push(Node *head, int data) {
    Node *node = malloc(sizeof(Node));
    node->data = data;
    node->next = head;
    return node;
}

void print_list(Node *head) {
    for (Node *curr = head; curr; curr = curr->next)
        printf("%d -> ", curr->data);
    printf("NULL\\n");
}

int main() {
    Node *list = NULL;
    for (int i = 1; i <= 6; i++)
        list = push(list, i * 10);

    printf("List:     ");
    print_list(list);

    /* Reverse in-place using pointer manipulation */
    Node *prev = NULL, *curr = list;
    while (curr) {
        Node *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }

    printf("Reversed: ");
    print_list(prev);
    return 0;
}`,
  },
  {
    label: "Bit Manipulation",
    code: `#include <stdio.h>

void print_bits(unsigned char n) {
    for (int i = 7; i >= 0; i--)
        printf("%d", (n >> i) & 1);
}

int main() {
    unsigned char a = 0xB3, b = 0x6A;

    printf("a     = "); print_bits(a); printf(" (0x%02X)\\n", a);
    printf("b     = "); print_bits(b); printf(" (0x%02X)\\n", b);
    printf("a & b = "); print_bits(a & b); printf("\\n");
    printf("a | b = "); print_bits(a | b); printf("\\n");
    printf("a ^ b = "); print_bits(a ^ b); printf("\\n");

    /* Brian Kernighan's bit-counting algorithm */
    unsigned char n = a;
    int count = 0;
    while (n) { n &= n - 1; count++; }
    printf("\\nBits set in 0x%02X: %d\\n", a, count);

    printf("Powers of 2 (1-16): ");
    for (int i = 1; i <= 16; i++)
        if ((i & (i - 1)) == 0) printf("%d ", i);
    printf("\\n");
    return 0;
}`,
  },
];

// ---------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------

const JAVA_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "Streams API",
    code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        var stack = List.of(
            "TypeScript", "React", "Node.js", "AWS",
            "Docker", "Python", "Java", "GraphQL",
            "MongoDB", "PostgreSQL", "Redis", "Kafka"
        );

        System.out.println("=== Tech Stack Analysis ===");
        System.out.println();

        stack.stream()
            .collect(Collectors.groupingBy(String::length))
            .entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(e -> System.out.printf(
                "%2d chars: %s%n", e.getKey(),
                String.join(", ", e.getValue())
            ));

        System.out.println();
        System.out.println("Top 5 longest (uppercased):");
        stack.stream()
            .sorted(Comparator.comparingInt(String::length).reversed())
            .limit(5)
            .map(String::toUpperCase)
            .forEach(s -> System.out.println("  -> " + s));
    }
}`,
  },
  {
    label: "Observer Pattern",
    code: `import java.util.*;
import java.util.function.*;

public class Main {
    static class EventBus<T> {
        private final Map<String, List<Consumer<T>>> listeners
            = new HashMap<>();

        void on(String event, Consumer<T> handler) {
            listeners.computeIfAbsent(
                event, k -> new ArrayList<>()
            ).add(handler);
        }

        void emit(String event, T data) {
            listeners.getOrDefault(event, List.of())
                .forEach(h -> h.accept(data));
        }
    }

    public static void main(String[] args) {
        var bus = new EventBus<String>();

        bus.on("login", n ->
            System.out.println("  AUTH: " + n + " logged in"));
        bus.on("login", n ->
            System.out.println("  LOG: session for " + n));
        bus.on("purchase", item ->
            System.out.println("  SHOP: " + item));
        bus.on("purchase", item ->
            System.out.println("  TRACK: " + item));

        System.out.println("--- User Session ---");
        bus.emit("login", "Marcelo");
        System.out.println();
        bus.emit("purchase", "Cloud Hosting");
        bus.emit("purchase", "Domain Name");
    }
}`,
  },
];

// ---------------------------------------------------------------------------
// Assembly (NASM x86 32-bit)
// ---------------------------------------------------------------------------

const ASSEMBLY_SNIPPETS: PlaygroundSnippet[] = [
  {
    label: "System Calls",
    code: `section .data
    msg1 db 'Hello from x86 Assembly!', 10
    len1 equ $ - msg1
    msg2 db 'Direct Linux syscalls, no libc!', 10
    len2 equ $ - msg2
    msg3 db 'Registers: eax, ebx, ecx, edx', 10
    len3 equ $ - msg3

section .text
    global _start

_start:
    mov eax, 4          ; sys_write
    mov ebx, 1          ; stdout
    mov ecx, msg1
    mov edx, len1
    int 0x80

    mov eax, 4
    mov ebx, 1
    mov ecx, msg2
    mov edx, len2
    int 0x80

    mov eax, 4
    mov ebx, 1
    mov ecx, msg3
    mov edx, len3
    int 0x80

    mov eax, 1          ; sys_exit
    xor ebx, ebx        ; code 0
    int 0x80`,
  },
  {
    label: "Triangle Pattern",
    code: `section .data
    star db '*'
    nl   db 10

section .text
    global _start

_start:
    mov esi, 1          ; row counter

.row:
    cmp esi, 8
    jg  .done
    mov edi, esi        ; stars per row

.col:
    test edi, edi
    jz   .newline
    mov  eax, 4         ; sys_write
    mov  ebx, 1         ; stdout
    mov  ecx, star
    mov  edx, 1
    int  0x80
    dec  edi
    jmp  .col

.newline:
    mov eax, 4
    mov ebx, 1
    mov ecx, nl
    mov edx, 1
    int 0x80
    inc esi
    jmp .row

.done:
    mov eax, 1          ; sys_exit
    xor ebx, ebx
    int 0x80`,
  },
];

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const PLAYGROUND_LANGUAGES: PlaygroundLanguage[] = [
  {
    id: "javascript",
    label: "JavaScript",
    shortLabel: "JS",
    pistonRuntime: "javascript",
    browserExecutable: true,
    snippets: JAVASCRIPT_SNIPPETS,
  },
  {
    id: "typescript",
    label: "TypeScript",
    shortLabel: "TS",
    pistonRuntime: "typescript",
    browserExecutable: false,
    snippets: TYPESCRIPT_SNIPPETS,
  },
  {
    id: "python",
    label: "Python",
    shortLabel: "PY",
    pistonRuntime: "python",
    browserExecutable: false,
    snippets: PYTHON_SNIPPETS,
  },
  {
    id: "csharp",
    label: "C#",
    shortLabel: "C#",
    pistonRuntime: "csharp",
    browserExecutable: false,
    snippets: CSHARP_SNIPPETS,
  },
  {
    id: "c",
    label: "C",
    shortLabel: "C",
    pistonRuntime: "c",
    browserExecutable: false,
    snippets: C_SNIPPETS,
  },
  {
    id: "java",
    label: "Java",
    shortLabel: "Java",
    pistonRuntime: "java",
    browserExecutable: false,
    snippets: JAVA_SNIPPETS,
  },
  {
    id: "assembly",
    label: "Assembly",
    shortLabel: "ASM",
    pistonRuntime: "nasm",
    browserExecutable: false,
    snippets: ASSEMBLY_SNIPPETS,
  },
];
