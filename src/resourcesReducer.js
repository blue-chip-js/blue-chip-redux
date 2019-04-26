import produce from "immer";

const initialState = {
  index: {}
};

export default function resourcesReducer(state = initialState, action) {
  const {
    type,
    id,
    attributes,
    links,
    relationships,
    resourcesById,
    resourceTypes,
    resourceType,
    resources,
    index
  } = action;
  return produce(state, draft => {
    switch (type) {
      case "UPDATE_RESOURCE_BY_ID":
        _initializeResource(draft, resourceType);
        _initializeIndex(draft, resourceType);

        const resource = {
          type: resourceType,
          id,
          attributes,
          links,
          relationships
        };

        // Partially update or insert resource
        updateResource(draft, resourceType, id, resource);  

        const indexPosition = draft.index[resourceType].indexOf(id);
        // Add to index if it does not yet exist
        if (indexPosition === -1) {
          draft.index[resourceType].push(id);
        }
        break;
      case "UPDATE_RESOURCES":
        _initializeResource(draft, resourceType);
        _initializeIndex(draft, resourceType);
        let newIndex = index.slice(0);
        Object.entries(resourcesById).forEach(([id, resource]) => {
          // Partially update or insert resource
          updateResource(draft, resourceType, id, resource);
          
          // Normalize the ids during findIndex to strings
          const indexPosition = draft.index[resourceType].indexOf(resource.id);
          // Remove from the new index order if it already exists (keeps original order on update)
          if (indexPosition !== -1) {
            newIndex = newIndex.filter(indexId => indexId !== resource.id);
          }
        });
        draft.index[resourceType] = draft.index[resourceType].concat(newIndex);
        break;
      case "REMOVE_RESOURCE_BY_ID":
        delete draft[resourceType][id];
        _removeFromIndex(draft, resourceType, id);
        break;
      case "REMOVE_RESOURCES_BY_ID":
        resources.forEach(resource => {
          delete draft[resource.type][resource.id];
          _removeFromIndex(draft, resource.type, resource.id);
        });
        break;
      case "CLEAR_RESOURCES":
        if (!resourceTypes) {
          // Clear everything
          return initialState;
        }
        resourceTypes.forEach(resourceType => {
          draft[resourceType] = {};
          draft.index[resourceType] = [];
        });
        break;
    }
  });
}

const updateResource = (draft, resourceType, id, resource) => {
  // handle existing by only updating what changed
  if (draft[resourceType][id]) {
    // handle existing by only updating what changed
    const oldResource = draft[resourceType][id];
    if (oldResource.attributes && resource.attributes) {
      draft[resourceType][id].attributes = {
        ...oldResource.attributes,
        ...resource.attributes
      };
    } else if (resource.attributes) {
      draft[resourceType][id].attributes = resource.attributes;
    }

    if (oldResource.relationships && resource.relationships) {
      draft[resourceType][id].relationships = {
        ...oldResource.relationships,
        ...resource.relationships
      };
    } else if (resource.relationships) {
      draft[resourceType][id].relationships = resource.relationships;
    }

    if (oldResource.links && resource.links) {
      draft[resourceType][id].links = {
        ...oldResource.links,
        ...resource.links
      };
    } else if (resource.links) {
      draft[resourceType][id].links = resource.links;
    }
  } else {
    // New resource
    draft[resourceType][id] = resource;
  }
};

const _initializeResource = (draft, resourceType) => {
  if (resourceType in draft) return;
  draft[resourceType] = {};
};

const _initializeIndex = (draft, resourceType) => {
  if (resourceType in draft.index) {
    return;
  }
  draft.index[resourceType] = [];
};

const _removeFromIndex = (draft, resourceType, id) => {
  if (!draft.index[resourceType]) {
    draft.index[resourceType] = [];
    return;
  }
  draft.index[resourceType] = draft.index[resourceType].filter(
    indexId => indexId !== id
  );
};
