type Props = {
  language: string | number | readonly string[] | undefined;
  setLanguage: (
    language: string | number | readonly string[] | undefined,
  ) => void;
};

export default function LanguageSelectBox({ language, setLanguage }: Props) {
  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="c">C</option>
        <option value="css">CSS</option>
        <option value="dockerfile">Dockerfile</option>
        <option value="xml">HTML, XML</option>
        <option value="javascript">JavaScript</option>
        <option value="json">JSON</option>
        <option value="nginx">Nginx Config</option>
        <option value="php">PHP</option>
        <option value="pgsql">PostgreSQL</option>
        <option value="python">Python</option>
        <option value="typescript">TypeScript</option>
      </select>
    </div>
  );
}
