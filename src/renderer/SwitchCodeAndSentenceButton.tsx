import { Button } from '@mui/material';

type Props = {
  isHighlight: boolean;
  onChange: (isHighlight: boolean) => void;
};

export default function SwitchCodeAndSentenceButton({
  isHighlight,
  onChange,
}: Props) {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={() => onChange(!isHighlight)}
    >
      {isHighlight ? '文章に変換' : 'コードに変換'}
    </Button>
  );
}
