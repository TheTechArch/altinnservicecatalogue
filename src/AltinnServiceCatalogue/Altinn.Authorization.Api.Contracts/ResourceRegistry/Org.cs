namespace Altinn.Authorization.Api.Contracts.ResourceRegistry
{
    /// <summary>
    /// Describes an organization
    /// </summary>
    public class Org
    {
        /// <summary>
        /// Name of organization. With lanugage support
        /// </summary>
        public IReadOnlyDictionary<string, string> Name { get; set; } = new Dictionary<string, string>();

        /// <summary>
        /// The logo
        /// </summary>
        public string Logo { get; set; }

        /// <summary>
        /// The organization number
        /// </summary>
        public string Orgnr { get; set; }   

        /// <summary>
        /// The homepage
        /// </summary>
        public string Homepage { get; set; }

        /// <summary>
        /// The environments available for the organzation
        /// </summary>
        public IReadOnlyCollection<string> Environments { get; set; } = new List<string>();
    }
}
