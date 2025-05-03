import Button from '@mui/material/Button';

type props = {
  handleExport: () => void;
};

export default function ExportButton({ handleExport }: props) {
  return (
    <Button variant="contained" onClick={handleExport}>
      エクスポート
    </Button>
  );
}
