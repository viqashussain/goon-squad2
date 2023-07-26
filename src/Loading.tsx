import { CircularProgress } from "@mui/material"

export const Loading = () => {
    return (
        <div style={{
            display: 'flex', justifyContent: 'center', top: '100px', position: 'relative'
        }}>
            <CircularProgress />
        </div>
    )
}