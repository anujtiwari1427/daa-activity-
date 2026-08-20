/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  Client-Side Max Heap — for Algorithm Visualization             ║
 * ║  Mirrors the Python implementation in heap/max_heap.py          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * This is used exclusively by the Algorithm Visualizer page to
 * render the heap tree and animate operations in real-time.
 */

class ClientMaxHeap {
    constructor() {
        this.heap = [];
    }

    /**
     * Compare two patients: returns true if a has higher priority.
     * Primary: priority (higher wins). Tiebreaker: arrival_time (earlier wins).
     */
    _hasHigherPriority(a, b) {
        if (a.priority !== b.priority) return a.priority > b.priority;
        return (a.arrival_time || '') < (b.arrival_time || '');
    }

    /**
     * Insert a patient and return step-by-step operations.
     * Time Complexity: O(log n)
     */
    insert(patient) {
        const steps = [];
        this.heap.push(patient);
        const idx = this.heap.length - 1;
        steps.push({
            action: 'insert',
            index: idx,
            description: `Insert ${patient.name} (Priority ${patient.priority}) at index ${idx}`
        });

        // Heapify Up
        let i = idx;
        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);
            if (this._hasHigherPriority(this.heap[i], this.heap[parent])) {
                steps.push({
                    action: 'swap',
                    index_a: i,
                    index_b: parent,
                    description: `Swap ${this.heap[i].name} (idx ${i}) ↑ with ${this.heap[parent].name} (idx ${parent})`
                });
                [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
                i = parent;
            } else {
                break;
            }
        }
        return steps;
    }

    /**
     * Extract the max (root) and return step-by-step operations.
     * Time Complexity: O(log n)
     */
    extractMax() {
        if (this.heap.length === 0) return { patient: null, steps: [] };

        const steps = [];
        const max = this.heap[0];
        steps.push({
            action: 'extract',
            index: 0,
            description: `Extract root: ${max.name} (Priority ${max.priority})`
        });

        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            steps.push({
                action: 'move_to_root',
                index: 0,
                description: `Move ${last.name} to root position`
            });

            // Heapify Down
            let i = 0;
            const size = this.heap.length;
            while (true) {
                let largest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;

                if (left < size && this._hasHigherPriority(this.heap[left], this.heap[largest])) {
                    largest = left;
                }
                if (right < size && this._hasHigherPriority(this.heap[right], this.heap[largest])) {
                    largest = right;
                }

                if (largest !== i) {
                    steps.push({
                        action: 'swap',
                        index_a: i,
                        index_b: largest,
                        description: `Swap ${this.heap[i].name} (idx ${i}) ↓ with ${this.heap[largest].name} (idx ${largest})`
                    });
                    [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
                    i = largest;
                } else {
                    break;
                }
            }
        }

        return { patient: max, steps };
    }

    peek() { return this.heap.length > 0 ? this.heap[0] : null; }
    size() { return this.heap.length; }
    isEmpty() { return this.heap.length === 0; }
    getAll() { return [...this.heap]; }
    clear() { this.heap = []; }
}

// Global instance for the visualizer
window.vizHeap = new ClientMaxHeap();
