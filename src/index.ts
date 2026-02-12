import { app } from "./server";


const PORT = 3000;


app.listen(PORT, () => {
    console.log(`Pulse-Check API running on port ${PORT}`);
});
