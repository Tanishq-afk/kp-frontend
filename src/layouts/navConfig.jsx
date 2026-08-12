import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import { ROLE } from 'src/config/constants.js';

// Sidebar navigation, filtered by role in AppLayout.
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <SpaceDashboardRoundedIcon />, roles: [ROLE.SUPERADMIN] },
  { label: 'Billing', path: '/billing', icon: <PointOfSaleRoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Returns', path: '/returns', icon: <AssignmentReturnRoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Products', path: '/products', icon: <Inventory2RoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Categories', path: '/categories', icon: <CategoryRoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Print Queue', path: '/print-queue', icon: <QrCode2RoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Customers', path: '/customers', icon: <PeopleAltRoundedIcon />, roles: [ROLE.ADMIN] },
  { label: 'Bills', path: '/bills', icon: <ReceiptLongRoundedIcon />, roles: [ROLE.ADMIN, ROLE.SUPERADMIN] },
  { label: 'Day Summary', path: '/day-summary', icon: <SummarizeRoundedIcon />, roles: [ROLE.ADMIN, ROLE.SUPERADMIN] },
];
