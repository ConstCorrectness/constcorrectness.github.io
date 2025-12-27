---
jupytext:
  formats: md:myst
  text_representation:
    extension: .md
    format_name: myst
kernelspec:
  display_name: Python 3
  language: python
  name: python3
---

# The Philosophy of Const Correctness

"Const correctness" is more than just a C++ keyword; it is a mindset of designing interfaces that communicate intent.

## Why it matters

When you mark a method as `const`, you are making a promise to the compiler and the caller: **"Calling this function will not change the visible state of the object."**

```cpp
class Renderer {
public:
    // This method promises not to alter the Renderer state
    int getDrawCalls() const { 
        return m_drawCalls; 
    }

    // This method explicitly changes state
    void reset() { 
        m_drawCalls = 0; 
    }

private:
    int m_drawCalls = 0;
};