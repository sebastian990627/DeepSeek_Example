using Microsoft.Extensions.AI;

namespace DeepSeek_Example.Class
{
    public static class ChatMessageExtensions
    {
        public static string CSSJustifyClass(this ChatMessage message)
        {
            return message.Role == ChatRole.User? "justify-content-start" : "justify-content-end";
        }
        public static string CSSColorClass(this ChatMessage message)
        {
            return message.Role == ChatRole.User ? "alert-primary" : "alert-info";
        }
    }
    public partial class ChatMessageAndClass:ChatMessage
    {
        public string JustifyClass { get; set; }
        public string Message { get; set; }
    }
}
