import { db, problemsTable } from "@workspace/db";

const seedProblems = [
  {
    id: "reverse-string",
    title: "Reverse a String",
    description: "Write a function that returns a string in reverse order. For example, reverseString(\"hello\") should return \"olleh\".",
    language: "JavaScript",
    difficulty: "easy",
    starterCode: "function reverseString(text) {\n  // Your code here\n}\n",
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz",
    description: "Return the numbers from 1 to n, replacing multiples of 3 with \"Fizz\", multiples of 5 with \"Buzz\", and multiples of both with \"FizzBuzz\". For n = 5, return [1, 2, \"Fizz\", 4, \"Buzz\"].",
    language: "JavaScript",
    difficulty: "easy",
    starterCode: "function fizzBuzz(n) {\n  // Your code here\n}\n",
  },
  {
    id: "find-largest-number",
    title: "Find the Largest Number",
    description: "Find and return the largest number in an array. For example, findLargest([3, 9, 2]) should return 9.",
    language: "JavaScript",
    difficulty: "easy",
    starterCode: "function findLargest(numbers) {\n  // Your code here\n}\n",
  },
  {
    id: "palindrome-checker",
    title: "Palindrome Checker",
    description: "Check whether a word or phrase reads the same forward and backward, ignoring spaces and letter case. For example, isPalindrome(\"Never odd or even\") should return true.",
    language: "JavaScript",
    difficulty: "medium",
    starterCode: "function isPalindrome(text) {\n  // Your code here\n}\n",
  },
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Return the indices of two numbers that add up to the target. For example, twoSum([2, 7, 11, 15], 9) should return [0, 1].",
    language: "JavaScript",
    difficulty: "medium",
    starterCode: "function twoSum(numbers, target) {\n  // Your code here\n}\n",
  },
  {
    id: "flatten-nested-array",
    title: "Flatten a Nested Array",
    description: "Turn an array nested to any depth into a single-level array while preserving order. For example, flattenArray([1, [2, [3]]]) should return [1, 2, 3].",
    language: "JavaScript",
    difficulty: "hard",
    starterCode: "function flattenArray(items) {\n  // Your code here\n}\n",
  },
];

let seedPromise: Promise<void> | undefined;

export function ensureSeedProblems(): Promise<void> {
  if (!seedPromise) {
    seedPromise = db.insert(problemsTable).values(seedProblems).onConflictDoNothing().then(() => undefined).catch((error: unknown) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}