import torch
import torch.nn as nn
from torchvision import models

MODEL_PATH = "pneumonia_resnet18.pth"


def load_model():
    model = models.resnet18(weights=None)

    model.fc = nn.Linear(model.fc.in_features, 2)

    state_dict = torch.load(
        MODEL_PATH,
        map_location="cpu"
    )

    model.load_state_dict(state_dict)

    model.eval()

    return model


model = load_model()

print("Model loaded successfully!")