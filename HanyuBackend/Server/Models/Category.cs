using System.ComponentModel.DataAnnotations;

public class Category
{
    [Key] 
    public string CategoryID { get; set; } = string.Empty; 

    public string CategoryName { get; set; } = string.Empty;
    
    public string CategoryType { get; set; } = "system"; 
}