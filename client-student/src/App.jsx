import { useEffect } from "react";
import axios from "axios";

function App() {
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/health`)
      .then(res => console.log("Backend says:", res.data))
      .catch(err => console.error("Connection failed:", err));
  }, []);

  return <div>VolunteerNet</div>;
}

export default App;