import { createTheme } from '@mui/material/styles'

// Brand colors
export const BRAND_COLORS = {
    primary: '#005180',    // Blue
    secondary: '#78BE20',  // Green
    error: '#B92221',      // Red/Burgundy
    primaryDark: '#004875',
    primaryLight: '#0066a1',
}

// Shared MUI theme for all MRT tables
export const mrtTheme = createTheme({
    palette: {
        primary: { main: BRAND_COLORS.primary },
        secondary: { main: BRAND_COLORS.secondary },
        error: { main: BRAND_COLORS.error },
    },
    typography: {
        fontFamily: 'inherit',
    },
})

// Common MRT table styles
export const mrtTableStyles = {
    muiTableHeadCellProps: {
        sx: {
            backgroundColor: BRAND_COLORS.primary,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '14px 20px',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            '&:last-child': {
                borderRight: 'none',
            },
        },
    },
    muiTableBodyRowProps: ({ row }: any) => ({
        sx: {
            backgroundColor: row.index % 2 === 0 ? 'white' : 'rgba(185, 34, 33, 0.05)',
            '&:hover': {
                backgroundColor: 'rgba(120, 190, 32, 0.2)',
            },
            cursor: 'pointer',
        },
    }),
    muiTableBodyCellProps: {
        sx: {
            padding: '16px',
        },
    },
}
