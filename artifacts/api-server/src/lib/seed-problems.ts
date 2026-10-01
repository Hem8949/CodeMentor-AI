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
  {
    id: "python-reverse-string",
    title: "Reverse a String",
    description: "Return the characters in reverse order. For example, reverse_string(\"hello\") should return \"olleh\".",
    language: "Python",
    difficulty: "easy",
    starterCode: "def reverse_string(text):\n    # Your code here\n    pass\n",
  },
  {
    id: "python-fizz-buzz",
    title: "FizzBuzz",
    description: "Build values from 1 to n, replacing multiples of 3 with \"Fizz\", multiples of 5 with \"Buzz\", and both with \"FizzBuzz\". For n = 5, return [1, 2, \"Fizz\", 4, \"Buzz\"].",
    language: "Python",
    difficulty: "easy",
    starterCode: "def fizz_buzz(n):\n    # Your code here\n    pass\n",
  },
  {
    id: "python-largest-number",
    title: "Find the Largest Number",
    description: "Return the largest value in a list of numbers. For example, find_largest([3, 9, 2]) should return 9.",
    language: "Python",
    difficulty: "easy",
    starterCode: "def find_largest(numbers):\n    # Your code here\n    pass\n",
  },
  {
    id: "python-palindrome-checker",
    title: "Palindrome Checker",
    description: "Check whether text reads the same forward and backward, ignoring spaces and letter case. For example, is_palindrome(\"Never odd or even\") should return True.",
    language: "Python",
    difficulty: "medium",
    starterCode: "def is_palindrome(text):\n    # Your code here\n    pass\n",
  },
  {
    id: "java-reverse-string",
    title: "Reverse a String",
    description: "Return the characters in reverse order. For example, reverseString(\"hello\") should return \"olleh\".",
    language: "Java",
    difficulty: "easy",
    starterCode: "class Solution {\n    public String reverseString(String text) {\n        // Your code here\n        return \"\";\n    }\n}\n",
  },
  {
    id: "java-fizz-buzz",
    title: "FizzBuzz",
    description: "Build values from 1 to n, replacing multiples of 3 with \"Fizz\", multiples of 5 with \"Buzz\", and both with \"FizzBuzz\". For n = 5, return [\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"].",
    language: "Java",
    difficulty: "easy",
    starterCode: "import java.util.ArrayList;\nimport java.util.List;\n\nclass Solution {\n    public List<String> fizzBuzz(int n) {\n        // Your code here\n        return new ArrayList<>();\n    }\n}\n",
  },
  {
    id: "java-largest-number",
    title: "Find the Largest Number",
    description: "Return the largest value in an integer array. For example, findLargest(new int[]{3, 9, 2}) should return 9.",
    language: "Java",
    difficulty: "easy",
    starterCode: "class Solution {\n    public int findLargest(int[] numbers) {\n        // Your code here\n        return 0;\n    }\n}\n",
  },
  {
    id: "java-palindrome-checker",
    title: "Palindrome Checker",
    description: "Check whether text reads the same forward and backward, ignoring spaces and letter case. For example, isPalindrome(\"Never odd or even\") should return true.",
    language: "Java",
    difficulty: "medium",
    starterCode: "class Solution {\n    public boolean isPalindrome(String text) {\n        // Your code here\n        return false;\n    }\n}\n",
  },
  {
    id: "cpp-reverse-string",
    title: "Reverse a String",
    description: "Return the characters in reverse order. For example, reverseString(\"hello\") should return \"olleh\".",
    language: "C++",
    difficulty: "easy",
    starterCode: "#include <string>\n\nstd::string reverseString(const std::string& text) {\n    // Your code here\n    return \"\";\n}\n",
  },
  {
    id: "cpp-fizz-buzz",
    title: "FizzBuzz",
    description: "Build values from 1 to n, replacing multiples of 3 with \"Fizz\", multiples of 5 with \"Buzz\", and both with \"FizzBuzz\". For n = 5, return {\"1\", \"2\", \"Fizz\", \"4\", \"Buzz\"}.",
    language: "C++",
    difficulty: "easy",
    starterCode: "#include <string>\n#include <vector>\n\nstd::vector<std::string> fizzBuzz(int n) {\n    // Your code here\n    return {};\n}\n",
  },
  {
    id: "cpp-largest-number",
    title: "Find the Largest Number",
    description: "Return the largest value in a vector of integers. For example, findLargest({3, 9, 2}) should return 9.",
    language: "C++",
    difficulty: "easy",
    starterCode: "#include <vector>\n\nint findLargest(const std::vector<int>& numbers) {\n    // Your code here\n    return 0;\n}\n",
  },
  {
    id: "cpp-palindrome-checker",
    title: "Palindrome Checker",
    description: "Check whether text reads the same forward and backward, ignoring spaces and letter case. For example, isPalindrome(\"Never odd or even\") should return true.",
    language: "C++",
    difficulty: "medium",
    starterCode: "#include <string>\n\nbool isPalindrome(const std::string& text) {\n    // Your code here\n    return false;\n}\n",
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