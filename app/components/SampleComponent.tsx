import React, { useState, useRef, useEffect } from 'react';

// Global variable counter
let counter3 = 0;

function CounterDemo() {
  // State variable counter
  const [counter1, setCounter1] = useState(0);

  // useRef variable counter
  const counter2 = useRef(0);

  const incrementCounters = () => {
    // Increment state counter
    //setCounter1(counter1 + 1);

    // Increment useRef counter
    counter2.current = counter2.current + 1;

    // Increment global counter
    counter3++;
  };

  const increment = () => {
    // Increment state counter
    setCounter1(counter1 + 1);

    // Increment useRef counter
    //counter2.current = counter2.current + 1;

    // Increment global counter
    //counter3++;
  };

  useEffect(() => {
    if (counter3=== 0) {
    console.log("entering useEffect");
    counter3 = 1;
    counter2.current = 1;
    setCounter1(1);
    }
    return () => {
      console.log("exiting useEffect");
    };
  }, []); // Empty dependency array means this effect runs only once on mount and unmount

  return (
    <div>
      <p>Counter 1 (useState): {counter1}</p>
      <p>Counter 2 (useRef): {counter2.current}</p>
      <p>Counter 3 (Global): {counter3}</p>
      <button className='btn btn-neutral' onClick={incrementCounters}>Increment ref,global Counters</button>
      { " "}
      <button className='btn btn-neutral' onClick={increment}>Increment state Counters</button>
    </div>
  );
}

export default CounterDemo;