const COMPARE_KEY = 'p2c_compare_state';

export function getCompareState() {
  try {
    const raw = sessionStorage.getItem(COMPARE_KEY);
    if (!raw) {
      return { exam: null, colleges: [] };
    }

    const parsed = JSON.parse(raw);
    return {
      exam: parsed?.exam || null,
      colleges: Array.isArray(parsed?.colleges) ? parsed.colleges.slice(0, 2) : [],
    };
  } catch {
    return { exam: null, colleges: [] };
  }
}

export function setCompareState(state) {
  sessionStorage.setItem(
    COMPARE_KEY,
    JSON.stringify({
      exam: state?.exam || null,
      colleges: Array.isArray(state?.colleges) ? state.colleges.slice(0, 2) : [],
    })
  );
}

export function clearCompareState() {
  sessionStorage.removeItem(COMPARE_KEY);
}

export function toggleCompareCollege(exam, college) {
  const current = getCompareState();
  const sameExam = current.exam === exam || !current.exam;
  const baseState = sameExam ? current : { exam, colleges: [] };
  const exists = baseState.colleges.some((item) => item._id === college._id);

  if (exists) {
    const colleges = baseState.colleges.filter((item) => item._id !== college._id);
    const nextState = {
      exam: colleges.length ? exam : null,
      colleges,
    };
    setCompareState(nextState);
    return nextState;
  }

  const colleges = [...baseState.colleges, college].slice(-2);
  const nextState = { exam, colleges };
  setCompareState(nextState);
  return nextState;
}
