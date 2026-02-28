using Altinn.Urn.Json;

namespace Altinn.Authorization.Api.Contracts.ResourceRegistry
{
    /// <summary>
    /// Defines a  Policy Subject
    /// </summary>
    public class PolicySubject
    {
        /// <summary>
        /// Subject attributes that defines the subject
        /// </summary>
        public required IReadOnlyList<UrnJsonTypeValue> SubjectAttributes { get; init; }
    }
}
