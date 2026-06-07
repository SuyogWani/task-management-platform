import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {

 const [tasks,setTasks] = useState([]);

 useEffect(() => {
   api.get("/tasks")
      .then(res => setTasks(res.data));
 }, []);

 return (
   <div>
      <h1>Tasks</h1>

      {tasks.map(task => (
         <div key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.status}</p>
         </div>
      ))}
   </div>
 );
}

export default Dashboard;