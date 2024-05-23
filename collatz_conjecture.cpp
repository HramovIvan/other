#include <iostream>
using namespace std;

// Collatz conjecture
// (3n+1)
// To explain the essence of the hypothesis, consider the following sequence of numbers, called the Syracuse sequence.  Take any natural number n.  If it is even, then divide it by 2, and if it is odd, then multiply it by 3 and add 1 (we get 3n + 1).  We perform the same actions on the resulting number, and so on.
// There will always be 1 at the end.

int main() {
    unsigned long long int number = 1;
    cin >> number;
    cout << number << endl;
    if (number > 0 && number != 0) {
        while (number != 1) {
            if (number % 2 == 0) {
                number /= 2;
            } else {
                number = number * 3 + 1;
            }
            cout << number << endl;
        }
    } else {
        cout << "Wrong number!";
    }
    return 0;
}
