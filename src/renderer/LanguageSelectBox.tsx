type Props = {
  language: string | number | readonly string[] | undefined;
  setLanguage: (
    language: string | number | readonly string[] | undefined,
  ) => void;
};

export default function LanguageSelectBox({ language, setLanguage }: Props) {
  return (
    <div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
          width: '100%',
          height: '40px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          padding: '0 10px',
        }}
      >
        <option value="c">C</option>
        <option value="css">CSS</option>
        <option value="nginx">Nginx Config</option>
        <option value="php">PHP</option>
        <option value="pgsql">PostgreSQL</option>
        <option value="python">Python</option>
        <option value="typescript">TypeScript</option>
      </select>
    </div>
  );
}
