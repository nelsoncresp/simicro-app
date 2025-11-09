import app from './src/app.js';
import {connectDB} from './src/config/database.js';

const PORT = process.env.PORT || 3000;

//conexión
connectDB();

app.listen(PORT, () =>{
    console.log(`servidor corriendo simicro, en puerto ${PORT}`);
})