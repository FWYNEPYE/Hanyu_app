public class VocabDto
{
    public string hanzi { get; set; } = "";
    public string pinyin { get; set; } = "";
    public string meaning { get; set; } = "";
    public string type { get; set; } = "";
    public string radical { get; set; } = "";
    public string grammar { get; set; } = "";
    public List<ExampleDto> examples { get; set; } = new();
}
public class ExampleDto
{
    public string zh { get; set; } = "";
    public string vi { get; set; } = "";
}