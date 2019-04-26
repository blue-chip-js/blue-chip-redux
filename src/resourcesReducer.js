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
        _updateResource(draft, resourceType, id, resource);  

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
          _updateResource(draft, resourceType, id, resource);
          
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

const _updateResource = (draft, resourceType, id, newResource) => {
  if (draft[resourceType][id]) {
    const draftResource = draft[resourceType][id];
    
    _updateProperty("attributes", draftResource, newResource);
    _updateProperty("relationships", draftResource, newResource);
    _updateProperty("links", draftResource, newResource);
  } else {
    // New resource
    draft[resourceType][id] = newResource;
  }
};

const _updateProperty = (property, draftResource, newResource) => {
  if (draftResource[property] && newResource[property]) {
    // handle existing by only updating what changed
    draftResource[property] = {
      ...draftResource[property],
      ...newResource[property]
    };
  } else if (newResource[property]) {
    // Property didn't exist prior so add it
    draftResource[property] = newResource[property];
  }
}

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
