"""
╔══════════════════════════════════════════════════════════════════════╗
║       MAX HEAP — Priority Queue for Hospital Queue Management       ║
║                                                                      ║
║  Subject  : Design and Analysis of Algorithms (DAA)                  ║
║  Concept  : Priority Queue implemented using a Max Heap              ║
║                                                                      ║
║  A Max Heap is a complete binary tree where every parent node        ║
║  has a value GREATER THAN OR EQUAL TO its children.                  ║
║                                                                      ║
║  In our hospital system:                                             ║
║    - Each patient has a priority (1–10).                             ║
║    - The patient with the HIGHEST priority is always at the root.    ║
║    - When priorities are equal, the patient who arrived EARLIER      ║
║      is given preference (tie-breaker).                              ║
║                                                                      ║
║  TIME COMPLEXITIES:                                                  ║
║    Insert        : O(log n)                                          ║
║    Extract Max   : O(log n)                                          ║
║    Peek          : O(1)                                              ║
║    Build Heap    : O(n)                                              ║
║    Size / Empty  : O(1)                                              ║
║                                                                      ║
║  SPACE COMPLEXITY: O(n) — array-based storage                        ║
╚══════════════════════════════════════════════════════════════════════╝
"""


class MaxHeap:
    """
    Max Heap implementation for patient priority queue.

    Internal Representation
    ───────────────────────
    The heap is stored as a Python list (array).
    For a node at index i:
        - Parent index      = (i - 1) // 2
        - Left child index  = 2 * i + 1
        - Right child index = 2 * i + 2

    Each element in the heap is a dictionary representing a patient:
    {
        'id': int,
        'patient_id': str,
        'name': str,
        'priority': int,        ← PRIMARY comparison key
        'arrival_time': str,    ← SECONDARY comparison key (tie-breaker)
        'condition': str,
        'status': str,
        ...
    }
    """

    def __init__(self):
        """Initialize an empty Max Heap."""
        # ─── The heap array ──────────────────────────────────────
        # We use a simple Python list to store heap elements.
        # Index 0 is the root (highest-priority patient).
        self._heap = []

    # ══════════════════════════════════════════════════════════════
    #  COMPARISON HELPER
    # ══════════════════════════════════════════════════════════════

    def _has_higher_priority(self, patient_a, patient_b):
        """
        Compare two patients and return True if patient_a has
        HIGHER priority than patient_b.

        Comparison Rules:
        ─────────────────
        1. Higher 'priority' value  →  higher priority.
        2. If priorities are EQUAL  →  earlier 'arrival_time' wins.

        This ensures:
            - Critical patients (priority 10) are always served first.
            - Among equally critical patients, the one who arrived
              earlier gets served first (fairness).

        Parameters
        ----------
        patient_a : dict – First patient record.
        patient_b : dict – Second patient record.

        Returns
        -------
        bool – True if patient_a should be above patient_b in the heap.
        """
        # PRIMARY KEY: priority (higher is better)
        if patient_a['priority'] != patient_b['priority']:
            return patient_a['priority'] > patient_b['priority']

        # TIE-BREAKER: arrival_time (earlier is better → smaller string)
        return patient_a['arrival_time'] < patient_b['arrival_time']

    # ══════════════════════════════════════════════════════════════
    #  CORE OPERATIONS
    # ══════════════════════════════════════════════════════════════

    def insert(self, patient):
        """
        Insert a new patient into the Max Heap.

        Algorithm  (Heapify-Up / Bubble-Up / Swim)
        ───────────────────────────────────────────
        1. Append the new patient at the END of the array.
           (This maintains the complete binary tree property.)
        2. HEAPIFY UP: Compare the new node with its parent.
           - If the new node has HIGHER priority → SWAP with parent.
           - Repeat until the node reaches the root or its parent
             has higher priority.

        Time Complexity: O(log n)
        ─────────────────────────
        In the worst case, the new element bubbles up from the
        bottom of the tree to the root. The height of a complete
        binary tree with n nodes is ⌊log₂(n)⌋, so at most
        log₂(n) swaps are performed.

        Parameters
        ----------
        patient : dict – Patient record to insert.

        Returns
        -------
        list[dict] – Step-by-step swap operations for visualization.
        """
        steps = []  # Track operations for the Algorithm Visualizer page

        # Step 1: Add the new element at the end of the array
        self._heap.append(patient)
        steps.append({
            'action': 'insert',
            'index': len(self._heap) - 1,
            'patient': patient['name'],
            'description': f"Insert {patient['name']} (Priority {patient['priority']}) at index {len(self._heap) - 1}"
        })

        # Step 2: Heapify Up — restore the max-heap property
        up_steps = self._heapify_up(len(self._heap) - 1)
        steps.extend(up_steps)

        return steps

    def extract_max(self):
        """
        Remove and return the patient with the HIGHEST priority.

        Algorithm  (Heapify-Down / Bubble-Down / Sink)
        ────────────────────────────────────────────────
        1. Save the ROOT element (index 0) — this is the max.
        2. Move the LAST element in the array to the root position.
        3. Remove the last position (shrink the array by 1).
        4. HEAPIFY DOWN from the root:
           - Compare the node with its LEFT and RIGHT children.
           - Swap with the LARGER child if the child has higher priority.
           - Repeat until the node is in its correct position or
             it has no children.

        Time Complexity: O(log n)
        ─────────────────────────
        The element sinks from the root to at most the bottom level.
        Height = ⌊log₂(n)⌋, so at most log₂(n) swaps.

        Returns
        -------
        tuple(dict, list[dict]) – (extracted patient, step list)
        Returns (None, []) if the heap is empty.
        """
        if self.is_empty():
            return None, []

        steps = []

        # Step 1: The root is always the highest-priority patient
        max_patient = self._heap[0]
        steps.append({
            'action': 'extract',
            'index': 0,
            'patient': max_patient['name'],
            'description': f"Extract root: {max_patient['name']} (Priority {max_patient['priority']})"
        })

        # Step 2: Move the last element to the root
        last = self._heap.pop()
        if not self.is_empty():
            self._heap[0] = last
            steps.append({
                'action': 'move_to_root',
                'index': 0,
                'patient': last['name'],
                'description': f"Move {last['name']} to root position"
            })

            # Step 3: Heapify Down — restore the max-heap property
            down_steps = self._heapify_down(0)
            steps.extend(down_steps)

        return max_patient, steps

    def peek(self):
        """
        View the highest-priority patient WITHOUT removing them.

        Time Complexity: O(1)
        ─────────────────────
        The root of a Max Heap always contains the maximum element.
        We simply return self._heap[0].

        Returns
        -------
        dict or None – The highest-priority patient, or None if empty.
        """
        if self.is_empty():
            return None
        return self._heap[0]

    # ══════════════════════════════════════════════════════════════
    #  HEAPIFY OPERATIONS (The heart of the Max Heap)
    # ══════════════════════════════════════════════════════════════

    def _heapify_up(self, index):
        """
        Restore the max-heap property by moving a node UP the tree.

        Also known as: bubble-up, swim, sift-up, percolate-up.

        Algorithm
        ─────────
        Starting from the given index:
            1. Calculate the parent index: parent = (index - 1) // 2
            2. If the current node has HIGHER priority than its parent:
               → SWAP them.
               → Move index to the parent position.
               → Repeat from step 1.
            3. If the current node has LOWER or EQUAL priority:
               → STOP. The heap property is satisfied.

        Visual Example
        ──────────────
        Before inserting Priority 9:
                  10
                /    \\
              5        7
            / \\
           2   [9]  ← new node at index 4

        Step 1: Compare 9 with parent 5 → 9 > 5 → SWAP
                  10
                /    \\
              9        7
            / \\
           2   5

        Step 2: Compare 9 with parent 10 → 9 < 10 → STOP
        Heap property restored!

        Parameters
        ----------
        index : int – The index of the node to heapify up.

        Returns
        -------
        list[dict] – Swap steps for visualization.
        """
        steps = []

        while index > 0:
            # Calculate parent index using the formula
            parent_index = (index - 1) // 2

            # Compare current node with its parent
            if self._has_higher_priority(self._heap[index], self._heap[parent_index]):
                # Current node has higher priority → SWAP with parent
                steps.append({
                    'action': 'swap',
                    'index_a': index,
                    'index_b': parent_index,
                    'patient_a': self._heap[index]['name'],
                    'patient_b': self._heap[parent_index]['name'],
                    'description': (
                        f"Swap {self._heap[index]['name']} (index {index}) "
                        f"↑ with {self._heap[parent_index]['name']} (index {parent_index})"
                    )
                })
                self._heap[index], self._heap[parent_index] = \
                    self._heap[parent_index], self._heap[index]

                # Move up to the parent position and continue
                index = parent_index
            else:
                # Heap property satisfied → stop
                break

        return steps

    def _heapify_down(self, index):
        """
        Restore the max-heap property by moving a node DOWN the tree.

        Also known as: bubble-down, sink, sift-down, percolate-down.

        Algorithm
        ─────────
        Starting from the given index:
            1. Calculate left child:  left  = 2 * index + 1
               Calculate right child: right = 2 * index + 2
            2. Find the LARGEST among {current, left, right}.
            3. If the largest is NOT the current node:
               → SWAP current with the largest child.
               → Move index to the child's position.
               → Repeat from step 1.
            4. If the current node IS the largest:
               → STOP. The heap property is satisfied.

        Visual Example
        ──────────────
        After extracting max, node 2 is placed at root:
                  [2]  ← misplaced node
                /    \\
              9        7
            / \\
           5   1

        Step 1: Children are 9 and 7. Largest = 9 → SWAP with 9
                  9
                /    \\
              [2]      7
             / \\
            5   1

        Step 2: Children are 5 and 1. Largest = 5 → SWAP with 5
                  9
                /    \\
              5        7
            / \\
          [2]  1

        Step 3: Node 2 has no children → STOP
        Heap property restored!

        Parameters
        ----------
        index : int – The index of the node to heapify down.

        Returns
        -------
        list[dict] – Swap steps for visualization.
        """
        steps = []
        size = len(self._heap)

        while True:
            largest = index
            left = 2 * index + 1    # Left child index
            right = 2 * index + 2   # Right child index

            # Check if left child exists AND has higher priority
            if left < size and self._has_higher_priority(self._heap[left], self._heap[largest]):
                largest = left

            # Check if right child exists AND has higher priority than current largest
            if right < size and self._has_higher_priority(self._heap[right], self._heap[largest]):
                largest = right

            # If the largest is not the current node, swap and continue
            if largest != index:
                steps.append({
                    'action': 'swap',
                    'index_a': index,
                    'index_b': largest,
                    'patient_a': self._heap[index]['name'],
                    'patient_b': self._heap[largest]['name'],
                    'description': (
                        f"Swap {self._heap[index]['name']} (index {index}) "
                        f"↓ with {self._heap[largest]['name']} (index {largest})"
                    )
                })
                self._heap[index], self._heap[largest] = \
                    self._heap[largest], self._heap[index]

                index = largest  # Continue heapifying down
            else:
                # Heap property satisfied → stop
                break

        return steps

    # ══════════════════════════════════════════════════════════════
    #  BUILD HEAP — O(n) algorithm
    # ══════════════════════════════════════════════════════════════

    def build_heap(self, patients):
        """
        Build a Max Heap from an unsorted list of patients.

        Algorithm (Bottom-Up Heap Construction)
        ────────────────────────────────────────
        1. Place all elements into the array (ignore heap order).
        2. Starting from the LAST NON-LEAF node down to index 0:
           → Call heapify_down on each node.

        Why start from the last non-leaf?
        → Leaf nodes (roughly n/2 nodes) are already trivially valid heaps.
        → We only need to fix internal nodes.

        Time Complexity: O(n)
        ─────────────────────
        Although each heapify_down call is O(log n), most nodes are
        near the bottom (leaves), so they require very few comparisons.
        The mathematical sum works out to O(n), which is more efficient
        than inserting n elements one by one: O(n log n).

        Parameters
        ----------
        patients : list[dict] – List of patient records.
        """
        self._heap = list(patients)

        if len(self._heap) <= 1:
            return

        # Last non-leaf node index = (n // 2) - 1
        last_non_leaf = (len(self._heap) // 2) - 1

        # Heapify from last non-leaf up to the root
        for i in range(last_non_leaf, -1, -1):
            self._heapify_down(i)

    # ══════════════════════════════════════════════════════════════
    #  UTILITY METHODS
    # ══════════════════════════════════════════════════════════════

    def is_empty(self):
        """Check if the heap has no elements. O(1)."""
        return len(self._heap) == 0

    def size(self):
        """Return the number of elements in the heap. O(1)."""
        return len(self._heap)

    def get_all(self):
        """
        Return all elements in heap-order (array representation).
        Note: This is NOT sorted order — it's the internal array.
        The only guarantee is that index 0 is the maximum.
        """
        return list(self._heap)

    def get_sorted(self):
        """
        Return all elements sorted by priority (highest first).

        This is achieved by repeatedly extracting the max from a
        COPY of the heap. The original heap is NOT modified.

        Time Complexity: O(n log n) — equivalent to Heap Sort.
        """
        # Create a temporary copy
        temp_heap = MaxHeap()
        temp_heap._heap = list(self._heap)

        sorted_list = []
        while not temp_heap.is_empty():
            patient, _ = temp_heap.extract_max()
            sorted_list.append(patient)

        return sorted_list

    def remove_by_id(self, patient_db_id):
        """
        Remove a specific patient from the heap by their database ID.

        This is NOT a standard heap operation, but is useful for our
        hospital system (e.g., when a patient leaves before being called).

        Time Complexity: O(n) — we need to search for the patient first.

        Parameters
        ----------
        patient_db_id : int – The database ID of the patient to remove.

        Returns
        -------
        dict or None – The removed patient, or None if not found.
        """
        # Find the patient's index in the heap
        target_index = None
        for i, p in enumerate(self._heap):
            if p['id'] == patient_db_id:
                target_index = i
                break

        if target_index is None:
            return None

        removed = self._heap[target_index]

        # Replace with the last element and shrink the array
        last = self._heap.pop()
        if target_index < len(self._heap):
            self._heap[target_index] = last
            # Fix heap: the replacement might need to go up or down
            self._heapify_up(target_index)
            self._heapify_down(target_index)

        return removed

    def clear(self):
        """Remove all elements from the heap."""
        self._heap = []

    def __repr__(self):
        """String representation showing the heap array."""
        names = [f"{p['name']}({p['priority']})" for p in self._heap]
        return f"MaxHeap({names})"
