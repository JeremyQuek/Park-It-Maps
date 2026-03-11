import time
from functools import wraps
import psutil
import os

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not hasattr(wrapper, 'is_running'):
            wrapper.is_running = False

        if not wrapper.is_running:
            wrapper.is_running = True
            start_time = time.time()

            # 1. YOU MUST CALL THE FUNCTION HERE
            result = func(*args, **kwargs) 

            end_time = time.time()
            execution_time = end_time - start_time
            print(f"{func.__name__} execution time: {execution_time:.6f} seconds")
            
            wrapper.is_running = False
            
            # 2. YOU MUST RETURN THE RESULT
            return result
        else:
            # This handles recursive calls or re-entry
            return func(*args, **kwargs)
    return wrapper

def memory_usage(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        process = psutil.Process(os.getpid())

        start_mem = process.memory_info().rss / (1024 * 1024)  # Convert to MiB
        result = func(*args, **kwargs)
        end_mem = process.memory_info().rss / (1024 * 1024)  # Convert to MiB

        mem_diff = end_mem - start_mem
        print(f"{func.__name__} memory usage: {end_mem - start_mem:.2f} mb")
        return result

    return wrapper
