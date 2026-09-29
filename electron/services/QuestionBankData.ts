import { PracticeQuestion } from '../../src/types';

export const STARTER_QUESTIONS: PracticeQuestion[] = [
  // 1. Arrays & Hashing
  {
    id: 'dsa_01',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Arrays', 'Hashing'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    starterCode: {
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []\n\nprint(twoSum([2, 7, 11, 15], 9))\n`,
      javascript: `function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) return [seen.get(diff), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n}\nconsole.log(twoSum([2, 7, 11, 15], 9));\n`,
      java: `import java.util.HashMap;\nimport java.util.Arrays;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));\n    }\n}\n`
    },
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0, 1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1, 2]' },
      { input: '[3,3], 6', expectedOutput: '[0, 1]', isHidden: true }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Can you use a Hash Map to check for complement in O(1) time?'],
    solutionExplanation: 'Use a hash map to map each element to its index. Check complement in single pass.',
    tags: ['Array', 'Hash Table'],
    version: 1
  },
  {
    id: 'dsa_02',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    difficulty: 'Easy',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation'],
    topics: ['Arrays', 'Dynamic Programming'],
    description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.\n\nFind the maximum profit you can achieve by choosing a single day to buy and a different day in the future to sell.',
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'No transactions are done and max profit = 0.' }
    ],
    starterCode: {
      python: `def maxProfit(prices):\n    min_price = float('inf')\n    max_profit = 0\n    for p in prices:\n        if p < min_price:\n            min_price = p\n        elif p - min_price > max_profit:\n            max_profit = p - min_price\n    return max_profit\n\nprint(maxProfit([7, 1, 5, 3, 6, 4]))\n`,
      javascript: `function maxProfit(prices) {\n    let minPrice = Infinity;\n    let maxProfit = 0;\n    for (const p of prices) {\n        if (p < minPrice) minPrice = p;\n        else if (p - minPrice > maxProfit) maxProfit = p - minPrice;\n    }\n    return maxProfit;\n}\nconsole.log(maxProfit([7, 1, 5, 3, 6, 4]));\n`
    },
    testCases: [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5' },
      { input: '[7,6,4,3,1]', expectedOutput: '0' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Track the minimum price seen so far and compute potential profit.'],
    tags: ['Array', 'Dynamic Programming'],
    version: 1
  },
  {
    id: 'dsa_03',
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Arrays', 'Hashing'],
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' }
    ],
    starterCode: {
      python: `def containsDuplicate(nums):\n    return len(nums) != len(set(nums))\n\nprint(containsDuplicate([1, 2, 3, 1]))\n`,
      javascript: `function containsDuplicate(nums) {\n    return new Set(nums).size !== nums.length;\n}\nconsole.log(containsDuplicate([1, 2, 3, 1]));\n`
    },
    testCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Use a hash set to detect duplicate entries in O(1) average lookup time.'],
    tags: ['Array', 'Hash Table'],
    version: 1
  },
  {
    id: 'dsa_04',
    title: 'Maximum Subarray (Kadane Algorithm)',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Arrays', 'Dynamic Programming'],
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    starterCode: {
      python: `def maxSubArray(nums):\n    cur_sum = max_sum = nums[0]\n    for n in nums[1:]:\n        cur_sum = max(n, cur_sum + n)\n        max_sum = max(max_sum, cur_sum)\n    return max_sum\n\nprint(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))\n`,
      javascript: `function maxSubArray(nums) {\n    let cur = nums[0], max = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        max = Math.max(max, cur);\n    }\n    return max;\n}\nconsole.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));\n`
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Kadane algorithm: whether to extend existing subarray or start fresh from current element.'],
    tags: ['Array', 'Dynamic Programming'],
    version: 1
  },
  {
    id: 'dsa_05',
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Arrays', 'Prefix Sum'],
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.',
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }
    ],
    starterCode: {
      python: `def productExceptSelf(nums):\n    n = len(nums)\n    res = [1] * n\n    prefix = 1\n    for i in range(n):\n        res[i] = prefix\n        prefix *= nums[i]\n    postfix = 1\n    for i in range(n - 1, -1, -1):\n        res[i] *= postfix\n        postfix *= nums[i]\n    return res\n\nprint(productExceptSelf([1, 2, 3, 4]))\n`,
      javascript: `function productExceptSelf(nums) {\n    const res = new Array(nums.length).fill(1);\n    let pre = 1;\n    for (let i = 0; i < nums.length; i++) {\n        res[i] = pre;\n        pre *= nums[i];\n    }\n    let post = 1;\n    for (let i = nums.length - 1; i >= 0; i--) {\n        res[i] *= post;\n        post *= nums[i];\n    }\n    return res;\n}\nconsole.log(productExceptSelf([1, 2, 3, 4]));\n`
    },
    testCases: [
      { input: '[1,2,3,4]', expectedOutput: '[24, 12, 8, 6]' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Compute prefix products in first pass, suffix products in second pass.'],
    tags: ['Array', 'Prefix Sum'],
    version: 1
  },

  // 2. Strings & Two Pointers
  {
    id: 'dsa_06',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Strings', 'Two Pointers'],
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
    constraints: ['1 <= s.length <= 2 * 10^5'],
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' }
    ],
    starterCode: {
      python: `def isPalindrome(s: str) -> bool:\n    filtered = [c.lower() for c in s if c.isalnum()]\n    return filtered == filtered[::-1]\n\nprint(isPalindrome("A man, a plan, a canal: Panama"))\n`,
      javascript: `function isPalindrome(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return clean === clean.split('').reverse().join('');\n}\nconsole.log(isPalindrome("A man, a plan, a canal: Panama"));\n`
    },
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
      { input: '"race a car"', expectedOutput: 'false' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Filter alphanumeric characters or use two pointers from both ends.'],
    tags: ['Two Pointers', 'String'],
    version: 1
  },
  {
    id: 'dsa_07',
    title: '3Sum',
    slug: '3sum',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Arrays', 'Two Pointers', 'Sorting'],
    description: 'Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' }
    ],
    starterCode: {
      python: `def threeSum(nums):\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0: l += 1\n            elif s > 0: r -= 1\n            else:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l + 1]: l += 1\n                while l < r and nums[r] == nums[r - 1]: r -= 1\n                l += 1; r -= 1\n    return res\n\nprint(threeSum([-1, 0, 1, 2, -1, -4]))\n`,
      javascript: `function threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            const sum = nums[i] + nums[l] + nums[r];\n            if (sum < 0) l++;\n            else if (sum > 0) r--;\n            else {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l + 1]) l++;\n                while (l < r && nums[r] === nums[r - 1]) r--;\n                l++; r--;\n            }\n        }\n    }\n    return res;\n}\nconsole.log(threeSum([-1, 0, 1, 2, -1, -4]));\n`
    },
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1, -1, 2], [-1, 0, 1]]' }
    ],
    timeComplexityTarget: 'O(n^2)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Sort the array and use Two Pointers for each index.'],
    tags: ['Two Pointers', 'Sorting'],
    version: 1
  },
  {
    id: 'dsa_08',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Arrays', 'Two Pointers', 'Greedy'],
    description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn. Find two lines that together with the x-axis form a container that contains the most water.',
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' }
    ],
    starterCode: {
      python: `def maxArea(height):\n    l, r = 0, len(height) - 1\n    max_w = 0\n    while l < r:\n        w = (r - l) * min(height[l], height[r])\n        max_w = max(max_w, w)\n        if height[l] < height[r]: l += 1\n        else: r -= 1\n    return max_w\n\nprint(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]))\n`,
      javascript: `function maxArea(height) {\n    let l = 0, r = height.length - 1, max = 0;\n    while (l < r) {\n        const area = (r - l) * Math.min(height[l], height[r]);\n        max = Math.max(max, area);\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return max;\n}\nconsole.log(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]));\n`
    },
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Shrink the container width by moving the pointer with the smaller height.'],
    tags: ['Two Pointers', 'Greedy'],
    version: 1
  },

  // 3. Stacks & Queues
  {
    id: 'dsa_09',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation', 'Problem Solving'],
    topics: ['Strings', 'Stacks'],
    description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    constraints: ['1 <= s.length <= 10^4'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    starterCode: {
      python: `def isValid(s: str) -> bool:\n    st = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in pairs:\n            if not st or st.pop() != pairs[c]: return False\n        else:\n            st.append(c)\n    return len(st) == 0\n\nprint(isValid("()[]{}"))\n`,
      javascript: `function isValid(s) {\n    const st = [];\n    const pairs = { ')': '(', '}': '{', ']': '[' };\n    for (const c of s) {\n        if (pairs[c]) {\n            if (st.pop() !== pairs[c]) return false;\n        } else st.push(c);\n    }\n    return st.length === 0;\n}\nconsole.log(isValid("()[]{}"));\n`
    },
    testCases: [
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Use a stack (LIFO) to match every closing bracket with its counterpart.'],
    tags: ['Stack', 'String'],
    version: 1
  },
  {
    id: 'dsa_10',
    title: 'Min Stack Design',
    slug: 'min-stack',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation', 'OOP'],
    topics: ['Stacks', 'OOP', 'Design'],
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).',
    constraints: ['Methods push, pop, top and getMin must run in O(1) time.'],
    examples: [
      { input: 'MinStack(); push(-2); push(0); push(-3); getMin(); pop(); top(); getMin();', output: '[-3, 0, -2]' }
    ],
    starterCode: {
      python: `class MinStack:\n    def __init__(self):\n        self.st = []\n        self.min_st = []\n    def push(self, val: int) -> None:\n        self.st.append(val)\n        val = min(val, self.min_st[-1] if self.min_st else val)\n        self.min_st.append(val)\n    def pop(self) -> None:\n        self.st.pop()\n        self.min_st.pop()\n    def top(self) -> int:\n        return self.st[-1]\n    def getMin(self) -> int:\n        return self.min_st[-1]\n\nms = MinStack()\nms.push(-2); ms.push(0); ms.push(-3)\nprint("Min:", ms.getMin())\n`,
      javascript: `class MinStack {\n    constructor() {\n        this.st = [];\n        this.minSt = [];\n    }\n    push(val) {\n        this.st.push(val);\n        const curMin = this.minSt.length ? Math.min(val, this.minSt[this.minSt.length - 1]) : val;\n        this.minSt.push(curMin);\n    }\n    pop() { this.st.pop(); this.minSt.pop(); }\n    top() { return this.st[this.st.length - 1]; }\n    getMin() { return this.minSt[this.minSt.length - 1]; }\n}\nconst ms = new MinStack();\nms.push(-2); ms.push(0); ms.push(-3);\nconsole.log("Min:", ms.getMin());\n`
    },
    testCases: [
      { input: 'getMin after [-2, 0, -3]', expectedOutput: '-3' }
    ],
    timeComplexityTarget: 'O(1)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Keep a parallel stack or pair elements with current minimum.'],
    tags: ['Stack', 'Design'],
    version: 1
  },

  // 4. Binary Search
  {
    id: 'dsa_11',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Binary Search', 'Arrays'],
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, return its index; otherwise, return `-1`.',
    constraints: ['1 <= nums.length <= 10^4', 'All integers in nums are unique.', 'nums is sorted.'],
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' }
    ],
    starterCode: {
      python: `def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1\n\nprint(search([-1, 0, 3, 5, 9, 12], 9))\n`,
      javascript: `function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = Math.floor((l + r) / 2);\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}\nconsole.log(search([-1, 0, 3, 5, 9, 12], 9));\n`
    },
    testCases: [
      { input: '[-1,0,3,5,9,12], 9', expectedOutput: '4' },
      { input: '[-1,0,3,5,9,12], 2', expectedOutput: '-1' }
    ],
    timeComplexityTarget: 'O(log n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Halve the search interval at each step.'],
    tags: ['Binary Search'],
    version: 1
  },

  // 5. Linked Lists
  {
    id: 'dsa_12',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Linked Lists'],
    description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
    constraints: ['The number of nodes in the list is the range [0, 5000].'],
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }
    ],
    starterCode: {
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n\nprint("Reversed list head created.")\n`,
      javascript: `function reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}\nconsole.log("Reversed list logic ready.");\n`
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5, 4, 3, 2, 1]' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Maintain three pointers: prev, curr, and next.'],
    tags: ['Linked List'],
    version: 1
  },

  // 6. Trees
  {
    id: 'dsa_13',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    difficulty: 'Easy',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Trees', 'Recursion'],
    description: 'Given the `root` of a binary tree, invert the tree, and return its root.',
    constraints: ['The number of nodes in the tree is in the range [0, 100].'],
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }
    ],
    starterCode: {
      python: `class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root\n\nprint("Tree inverter ready.")\n`,
      javascript: `function invertTree(root) {\n    if (!root) return null;\n    const temp = root.left;\n    root.left = invertTree(root.right);\n    root.right = invertTree(temp);\n    return root;\n}\nconsole.log("Tree inverter ready.");\n`
    },
    testCases: [
      { input: '[4,2,7,1,3,6,9]', expectedOutput: '[4, 7, 2, 9, 6, 3, 1]' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(h)',
    hints: ['Recursively swap the left and right subtrees.'],
    tags: ['Tree', 'Binary Tree'],
    version: 1
  },
  {
    id: 'dsa_14',
    title: 'Validate Binary Search Tree',
    slug: 'validate-binary-search-tree',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Trees', 'BST'],
    description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST requires all keys in the left subtree to be strictly less than the node\'s key, and all keys in the right subtree to be strictly greater.',
    constraints: ['The number of nodes in the tree is in the range [1, 10^4].'],
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }
    ],
    starterCode: {
      python: `def isValidBST(root, low=float('-inf'), high=float('inf')):\n    if not root: return True\n    if not (low < root.val < high): return False\n    return isValidBST(root.left, low, root.val) and isValidBST(root.right, root.val, high)\n\nprint("BST Validator logic compiled.")\n`,
      javascript: `function isValidBST(root, low = -Infinity, high = Infinity) {\n    if (!root) return true;\n    if (root.val <= low || root.val >= high) return false;\n    return isValidBST(root.left, low, root.val) && isValidBST(root.right, root.val, high);\n}\nconsole.log("BST Validator logic compiled.");\n`
    },
    testCases: [
      { input: '[2,1,3]', expectedOutput: 'true' },
      { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(h)',
    hints: ['Pass valid intervals (min, max) down recursively.'],
    tags: ['Tree', 'Binary Search Tree'],
    version: 1
  },

  // 7. Dynamic Programming
  {
    id: 'dsa_15',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    categories: ['DSA', 'Dynamic Programming', 'Interview Preparation'],
    topics: ['Dynamic Programming', 'Math'],
    description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: 'n = 2', output: '2' },
      { input: 'n = 3', output: '3' }
    ],
    starterCode: {
      python: `def climbStairs(n: int) -> int:\n    if n <= 2: return n\n    one, two = 1, 2\n    for _ in range(3, n + 1):\n        one, two = two, one + two\n    return two\n\nprint("Ways for 5 stairs:", climbStairs(5))\n`,
      javascript: `function climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) {\n        const c = a + b;\n        a = b;\n        b = c;\n    }\n    return b;\n}\nconsole.log("Ways for 5 stairs:", climbStairs(5));\n`
    },
    testCases: [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '5', expectedOutput: '8' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['This is the Fibonacci sequence recurrence: f(n) = f(n-1) + f(n-2).'],
    tags: ['Dynamic Programming'],
    version: 1
  },
  {
    id: 'dsa_16',
    title: 'Coin Change',
    slug: 'coin-change',
    difficulty: 'Medium',
    categories: ['DSA', 'Dynamic Programming'],
    topics: ['Dynamic Programming'],
    description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' }
    ],
    starterCode: {
      python: `def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], 1 + dp[a - c])\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nprint(coinChange([1, 2, 5], 11))\n`,
      javascript: `function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (let i = 1; i <= amount; i++) {\n        for (const c of coins) {\n            if (i - c >= 0) dp[i] = Math.min(dp[i], 1 + dp[i - c]);\n        }\n    }\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}\nconsole.log(coinChange([1, 2, 5], 11));\n`
    },
    testCases: [
      { input: '[1,2,5], 11', expectedOutput: '3' },
      { input: '[2], 3', expectedOutput: '-1' }
    ],
    timeComplexityTarget: 'O(amount * coins.length)',
    spaceComplexityTarget: 'O(amount)',
    hints: ['Bottom-up DP table tracking fewest coins for each sub-amount from 0 to amount.'],
    tags: ['Dynamic Programming'],
    version: 1
  },

  // 8. Graphs
  {
    id: 'dsa_17',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    categories: ['DSA', 'Interview Preparation'],
    topics: ['Graphs', 'BFS', 'DFS'],
    description: 'Given an `m x n` 2D binary grid `grid` which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    examples: [
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }
    ],
    starterCode: {
      python: `def numIslands(grid):\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    islands = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                islands += 1\n                dfs(r, c)\n    return islands\n\nprint("Islands algorithm verified.")\n`,
      javascript: `function numIslands(grid) {\n    if (!grid.length) return 0;\n    let count = 0;\n    function dfs(r, c) {\n        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n    }\n    for (let r = 0; r < grid.length; r++) {\n        for (let c = 0; c < grid[0].length; c++) {\n            if (grid[r][c] === '1') { count++; dfs(r, c); }\n        }\n    }\n    return count;\n}\nconsole.log("Islands algorithm verified.");\n`
    },
    testCases: [
      { input: 'Grid with 3 islands', expectedOutput: '3' }
    ],
    timeComplexityTarget: 'O(M * N)',
    spaceComplexityTarget: 'O(M * N)',
    hints: ['Sink the island by marking visited land cells to 0 during traversal.'],
    tags: ['Graph', 'DFS', 'BFS'],
    version: 1
  },

  // 9. Core CS - DBMS & SQL
  {
    id: 'cs_dbms_01',
    title: 'Second Highest Salary & Index Optimization',
    slug: 'second-highest-salary',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'DBMS', 'Core CS'],
    topics: ['DBMS', 'SQL'],
    description: 'Write an SQL query to report the second highest salary from the Employee table. If there is no second highest salary, return null.\n\nAlso explain index optimization for 10M row table.',
    constraints: ['1 <= Employee.id <= 10^6'],
    examples: [
      { input: 'Employee table: salaries = [100, 200, 300]', output: '200' }
    ],
    starterCode: {
      python: `import sqlite3\n\nconn = sqlite3.connect(":memory:")\ncur = conn.cursor()\ncur.execute("CREATE TABLE Employee (id INT, salary INT)")\ncur.executemany("INSERT INTO Employee VALUES (?, ?)", [(1, 100), (2, 200), (3, 300)])\n\nquery = "SELECT MAX(salary) FROM Employee WHERE salary < (SELECT MAX(salary) FROM Employee)"\nres = cur.execute(query).fetchone()\nprint("Second Highest Salary:", res[0])\n`,
      javascript: `// SQL Simulation\nconst salaries = [100, 200, 300];\nconst uniqueSorted = [...new Set(salaries)].sort((a, b) => b - a);\nconsole.log("Second Highest:", uniqueSorted[1] ?? null);\n`
    },
    testCases: [
      { input: 'Employee: [100, 200, 300]', expectedOutput: '200' }
    ],
    hints: ['Subquery with MAX() or ORDER BY DESC LIMIT 1 OFFSET 1.'],
    tags: ['SQL', 'DBMS'],
    version: 1
  },
  {
    id: 'cs_dbms_02',
    title: 'Department Top Three Salaries (Dense Rank & Partitions)',
    slug: 'department-top-three-salaries',
    difficulty: 'Hard',
    categories: ['Interview Preparation', 'DBMS', 'Core CS'],
    topics: ['DBMS', 'SQL'],
    description: 'A company\'s executives are interested in seeing who earns the most money in each of the company\'s departments. A high earner in a department is an employee who has a salary in the top three unique salaries for that department.\n\nWrite an SQL query to find the employees who are high earners in each department using window functions.',
    constraints: ['Department and Employee schemas with foreign key references.'],
    examples: [
      { input: 'Department IT & Sales employees', output: 'List of top 3 unique salaries per dept' }
    ],
    starterCode: {
      python: `query = """\nSELECT Department, Employee, Salary FROM (\n    SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary,\n           DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) as rank\n    FROM Employee e JOIN Department d ON e.departmentId = d.id\n) ranked WHERE rank <= 3;\n"""\nprint("Window function query formulated.")\n`
    },
    testCases: [
      { input: 'Window function run', expectedOutput: 'Ranked top 3 per department' }
    ],
    hints: ['Use DENSE_RANK() partitioned by DepartmentId.'],
    tags: ['SQL', 'Window Functions'],
    version: 1
  },

  // 10. Core CS - OOP & System Design
  {
    id: 'cs_oop_01',
    title: 'OOP Design: LRU Cache Implementation',
    slug: 'lru-cache-implementation',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'OOP', 'System Design', 'Core CS'],
    topics: ['OOP', 'Linked Lists', 'Design'],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) get and put time complexity.',
    constraints: ['capacity <= 3000', 'Calls to get and put in O(1) average time.'],
    examples: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2);', output: '[null, null, null, 1, null, -1]' }
    ],
    starterCode: {
      python: `class DNode:\n    def __init__(self, k=0, v=0):\n        self.k, self.v = k, v\n        self.prev = self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.cache = {}\n        self.head, self.tail = DNode(), DNode()\n        self.head.next, self.tail.prev = self.tail, self.head\n    def get(self, key: int) -> int:\n        if key in self.cache:\n            node = self.cache[key]\n            self._remove(node); self._add(node)\n            return node.v\n        return -1\n    def put(self, key: int, value: int) -> None:\n        if key in self.cache: self._remove(self.cache[key])\n        node = DNode(key, value)\n        self.cache[key] = node; self._add(node)\n        if len(self.cache) > self.cap:\n            lru = self.head.next\n            self._remove(lru)\n            del self.cache[lru.k]\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n    def _add(self, node):\n        prev = self.tail.prev\n        prev.next = node; node.prev = prev\n        node.next = self.tail; self.tail.prev = node\n\nc = LRUCache(2); c.put(1, 100)\nprint("Got key 1:", c.get(1))\n`
    },
    testCases: [
      { input: 'get(1) after put(1, 100)', expectedOutput: '100' }
    ],
    timeComplexityTarget: 'O(1)',
    spaceComplexityTarget: 'O(capacity)',
    hints: ['Combine a Hash Map with a Doubly Linked List.'],
    tags: ['Design', 'OOP'],
    version: 1
  },
  {
    id: 'cs_sys_01',
    title: 'System Design: Token Bucket Rate Limiter',
    slug: 'token-bucket-rate-limiter',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'System Design', 'Core CS'],
    topics: ['System Design', 'Concurrency'],
    description: 'Implement a thread-safe Token Bucket Rate Limiter that allows bursts up to `capacity` tokens while continuously refilling at `refill_rate` tokens per second.',
    constraints: ['Thread-safe execution under concurrent API requests.'],
    examples: [
      { input: 'Capacity = 5, Refill = 1/sec. 6 requests immediately.', output: 'First 5 accepted, 6th rejected.' }
    ],
    starterCode: {
      python: `import time\nimport threading\n\nclass TokenBucket:\n    def __init__(self, capacity: int, refill_rate: float):\n        self.capacity = capacity\n        self.refill_rate = refill_rate\n        self.tokens = capacity\n        self.last_refill = time.time()\n        self.lock = threading.Lock()\n    def allow_request(self, tokens=1) -> bool:\n        with self.lock:\n            now = time.time()\n            elapsed = now - self.last_refill\n            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)\n            self.last_refill = now\n            if self.tokens >= tokens:\n                self.tokens -= tokens\n                return True\n            return False\n\ntb = TokenBucket(5, 1)\nprint("Req 1 allowed:", tb.allow_request())\n`
    },
    testCases: [
      { input: 'Initial request with full bucket', expectedOutput: 'True' }
    ],
    hints: ['Calculate tokens generated by elapsed time since last request.'],
    tags: ['System Design', 'Concurrency'],
    version: 1
  },

  // 11. Core CS - Operating Systems & Networks
  {
    id: 'cs_os_01',
    title: 'Operating Systems: Producer-Consumer Synchronization',
    slug: 'producer-consumer-synchronization',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'Operating Systems', 'Core CS'],
    topics: ['Operating Systems', 'Concurrency', 'Threads'],
    description: 'Demonstrate synchronization between a Producer and a Consumer using semaphores or mutex locks on a bounded buffer of size K without race conditions or deadlocks.',
    constraints: ['Buffer cannot overflow or underflow.'],
    examples: [
      { input: 'Buffer size = 3, 5 items produced and consumed', output: 'All 5 consumed in FIFO order.' }
    ],
    starterCode: {
      python: `import threading\nimport queue\n\nbuffer = queue.Queue(maxsize=3)\n\ndef producer():\n    for i in range(5):\n        buffer.put(i)\n        print(f"Produced: {i}")\n\ndef consumer():\n    for _ in range(5):\n        item = buffer.get()\n        print(f"Consumed: {item}")\n        buffer.task_done()\n\nt1 = threading.Thread(target=producer)\nt2 = threading.Thread(target=consumer)\nt1.start(); t2.start(); t1.join(); t2.join()\nprint("Producer-Consumer completed cleanly.")\n`
    },
    testCases: [
      { input: 'Run synchronization', expectedOutput: 'Producer-Consumer completed cleanly.' }
    ],
    hints: ['Use Mutex for buffer access and Semaphores to track empty/full slots.'],
    tags: ['Operating Systems', 'Threads'],
    version: 1
  },
  {
    id: 'cs_cn_01',
    title: 'Computer Networks: HTTP Request Parser & Status FSM',
    slug: 'http-request-parser',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'Computer Networks', 'Core CS'],
    topics: ['Computer Networks', 'Parsing'],
    description: 'Parse a raw HTTP/1.1 request string into its Method, URI, Version, Headers Dictionary, and Body according to RFC 9112.',
    constraints: ['Valid CRLF line separators.'],
    examples: [
      { input: 'GET /api/status HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n', output: 'Method: GET, URI: /api/status' }
    ],
    starterCode: {
      python: `def parse_http_request(raw_req: str):\n    parts = raw_req.split("\\r\\n\\r\\n", 1)\n    header_part = parts[0]\n    body = parts[1] if len(parts) > 1 else ""\n    lines = header_part.split("\\r\\n")\n    req_line = lines[0].split()\n    method, uri, version = req_line[0], req_line[1], req_line[2]\n    headers = {}\n    for line in lines[1:]:\n        if ": " in line:\n            k, v = line.split(": ", 1)\n            headers[k] = v\n    return {"method": method, "uri": uri, "version": version, "headers": headers, "body": body}\n\nreq = "GET /api/status HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n"\nprint("Parsed:", parse_http_request(req))\n`
    },
    testCases: [
      { input: 'GET /api/status HTTP/1.1', expectedOutput: 'GET' }
    ],
    hints: ['Split header from body by double CRLF, then parse request line.'],
    tags: ['Computer Networks', 'HTTP'],
    version: 1
  },
  {
    id: 'dsa_merge_intervals',
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Arrays', 'Sorting'],
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^4'],
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' }
    ],
    starterCode: {
      python: `def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for inv in intervals:\n        if not merged or merged[-1][1] < inv[0]:\n            merged.append(inv)\n        else:\n            merged[-1][1] = max(merged[-1][1], inv[1])\n    return merged\n\nprint(merge([[1,3],[2,6],[8,10],[15,18]]))\n`,
      javascript: `function merge(intervals) {\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [];\n    for (const inv of intervals) {\n        if (!merged.length || merged[merged.length - 1][1] < inv[0]) {\n            merged.push(inv);\n        } else {\n            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], inv[1]);\n        }\n    }\n    return merged;\n}\nconsole.log(merge([[1,3],[2,6],[8,10],[15,18]]));\n`,
      java: `import java.util.*;\npublic class Solution {\n    public static int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        for (int[] inv : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < inv[0]) {\n                merged.add(inv);\n            } else {\n                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], inv[1]);\n            }\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}\n`
    },
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1, 6], [8, 10], [15, 18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1, 5]]' }
    ],
    timeComplexityTarget: 'O(n log n)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Sort the intervals by their start time, then iterate and compare current start with previous end.'],
    tags: ['Array', 'Sorting'],
    version: 1
  },
  {
    id: 'dsa_longest_substring',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Strings', 'Sliding Window', 'Hashing'],
    description: 'Given a string `s`, find the length of the longest substring without duplicate characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1' }
    ],
    starterCode: {
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    char_map = {}\n    left = 0\n    max_len = 0\n    for right, c in enumerate(s):\n        if c in char_map and char_map[c] >= left:\n            left = char_map[c] + 1\n        char_map[c] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nprint(lengthOfLongestSubstring("abcabcbb"))\n`,
      javascript: `function lengthOfLongestSubstring(s) {\n    const map = new Map();\n    let left = 0, maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        const c = s[right];\n        if (map.has(c) && map.get(c) >= left) {\n            left = map.get(c) + 1;\n        }\n        map.set(c, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\nconsole.log(lengthOfLongestSubstring("abcabcbb"));\n`
    },
    testCases: [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(min(n, m))',
    hints: ['Use sliding window with two pointers and a hash map tracking last seen index of each character.'],
    tags: ['String', 'Sliding Window'],
    version: 1
  },
  {
    id: 'dsa_trapping_rain_water',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Arrays', 'Two Pointers', 'Stack'],
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' }
    ],
    starterCode: {
      python: `def trap(height):\n    if not height: return 0\n    l, r = 0, len(height) - 1\n    left_max, right_max = height[l], height[r]\n    water = 0\n    while l < r:\n        if left_max < right_max:\n            l += 1\n            left_max = max(left_max, height[l])\n            water += left_max - height[l]\n        else:\n            r -= 1\n            right_max = max(right_max, height[r])\n            water += right_max - height[r]\n    return water\n\nprint(trap([0,1,0,2,1,0,1,3,2,1,2,1]))\n`
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(1)',
    hints: ['Maintain left_max and right_max pointers. Water trapped at any index depends on min(left_max, right_max).'],
    tags: ['Two Pointers', 'Dynamic Programming'],
    version: 1
  },
  {
    id: 'dsa_kth_largest',
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element-in-an-array',
    difficulty: 'Medium',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Arrays', 'Heap', 'Divide and Conquer'],
    description: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array. Can you solve it in O(n) average time complexity?',
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }
    ],
    starterCode: {
      python: `import heapq\ndef findKthLargest(nums, k):\n    min_heap = []\n    for n in nums:\n        heapq.heappush(min_heap, n)\n        if len(min_heap) > k:\n            heapq.heappop(min_heap)\n    return min_heap[0]\n\nprint(findKthLargest([3,2,1,5,6,4], 2))\n`
    },
    testCases: [
      { input: '[3,2,1,5,6,4], 2', expectedOutput: '5' },
      { input: '[3,2,3,1,2,4,5,5,6], 4', expectedOutput: '4' }
    ],
    timeComplexityTarget: 'O(n log k)',
    spaceComplexityTarget: 'O(k)',
    hints: ['A min-heap of size k retains the k largest elements seen so far; root is the kth largest.'],
    tags: ['Heap', 'Priority Queue'],
    version: 1
  },
  {
    id: 'dsa_top_k_frequent',
    title: 'Top K Frequent Elements',
    slug: 'top-k-frequent-elements',
    difficulty: 'Medium',
    categories: ['DSA', 'Problem Solving', 'Interview Preparation', 'Python', 'Java', 'C++'],
    topics: ['Arrays', 'Hashing', 'Bucket Sort'],
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements in O(n) time.',
    constraints: ['1 <= nums.length <= 10^5', 'k is in range [1, unique elements]'],
    examples: [
      { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' },
      { input: 'nums = [1], k = 1', output: '[1]' }
    ],
    starterCode: {
      python: `from collections import Counter\ndef topKFrequent(nums, k):\n    count = Counter(nums)\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for num, freq in count.items():\n        buckets[freq].append(num)\n    res = []\n    for i in range(len(buckets) - 1, 0, -1):\n        for n in buckets[i]:\n            res.append(n)\n            if len(res) == k: return res\n    return res\n\nprint(topKFrequent([1,1,1,2,2,3], 2))\n`
    },
    testCases: [
      { input: '[1,1,1,2,2,3], 2', expectedOutput: '[1, 2]' }
    ],
    timeComplexityTarget: 'O(n)',
    spaceComplexityTarget: 'O(n)',
    hints: ['Count frequencies with a hash map, then place elements in frequency buckets.'],
    tags: ['Bucket Sort', 'Hash Table'],
    version: 1
  },
  {
    id: 'sd_url_shortener',
    title: 'System Design: Distributed URL Shortener (TinyURL)',
    slug: 'system-design-tinyurl',
    difficulty: 'Medium',
    categories: ['Interview Preparation', 'System Design', 'Backend'],
    topics: ['System Design', 'Hashing', 'Distributed Systems'],
    description: 'Design a distributed system to shorten long URLs (e.g., bit.ly). Handle 100M new URLs per day with 10:1 read-to-write ratio, 7-character Base62 encoding, and high availability.',
    constraints: ['Collision-free Base62 encoding', 'Sub-10ms redirect latency'],
    examples: [
      { input: 'Encode: "https://engineering.google.com/careers/software-engineer"', output: 'https://tiny.elix/aB9zK1q' }
    ],
    starterCode: {
      python: `import hashlib\n\nclass URLShortener:\n    BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"\n    def __init__(self):\n        self.url_map = {}\n        self.counter = 100000000\n    def encode(self, long_url: str) -> str:\n        self.counter += 1\n        n = self.counter\n        short = []\n        while n > 0:\n            short.append(self.BASE62[n % 62])\n            n //= 62\n        code = "".join(reversed(short))\n        self.url_map[code] = long_url\n        return f"https://elix.ly/{code}"\n    def decode(self, code: str) -> str:\n        return self.url_map.get(code.split("/")[-1], "Not Found")\n\ns = URLShortener()\nshort = s.encode("https://github.com/microsoft/vscode")\nprint("Short:", short)\nprint("Original:", s.decode(short))\n`
    },
    testCases: [
      { input: 'Encode and Decode URL', expectedOutput: 'https://github.com/microsoft/vscode' }
    ],
    hints: ['Use distributed ID generator (Snowflake/Ticket service) and convert 64-bit integer to Base62.'],
    tags: ['System Design', 'Scalability'],
    version: 1
  },
  {
    id: 'web_debounce_throttle',
    title: 'Frontend: Debounce and Throttle Implementation',
    slug: 'frontend-debounce-throttle',
    difficulty: 'Medium',
    categories: ['Web Development', 'Interview Preparation', 'JavaScript'],
    topics: ['JavaScript', 'Web', 'Performance'],
    description: 'Implement production-ready `debounce(fn, delay)` and `throttle(fn, limit)` utility functions that preserve `this` context and pass through all arguments.',
    constraints: ['Accurate timer clearance', 'Immediate leading edge execution support'],
    examples: [
      { input: 'debounce(searchHandler, 300)', output: 'Executes once 300ms after last keystroke' }
    ],
    starterCode: {
      javascript: `function debounce(func, wait) {\n    let timeoutId = null;\n    return function(...args) {\n        const context = this;\n        if (timeoutId) clearTimeout(timeoutId);\n        timeoutId = setTimeout(() => {\n            func.apply(context, args);\n        }, wait);\n    };\n}\n\nfunction throttle(func, limit) {\n    let inThrottle = false;\n    return function(...args) {\n        const context = this;\n        if (!inThrottle) {\n            func.apply(context, args);\n            inThrottle = true;\n            setTimeout(() => (inThrottle = false), limit);\n        }\n    };\n}\n\nconst log = debounce((msg) => console.log("Debounced:", msg), 200);\nlog("Hello Elix");\n`
    },
    testCases: [
      { input: 'Run debounce test', expectedOutput: 'Debounced: Hello Elix' }
    ],
    hints: ['Use closures to maintain timer reference and check execution window.'],
    tags: ['JavaScript', 'Performance'],
    version: 1
  }
];
