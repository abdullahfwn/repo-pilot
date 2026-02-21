from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

# A basic feature extractor for the file tree
def extract_features(file_tree: list[str]) -> dict:
    features = {
        'total_files': len(file_tree),
        'js_ts_files': sum(1 for f in file_tree if f.endswith(('.js', '.ts', '.jsx', '.tsx'))),
        'py_files': sum(1 for f in file_tree if f.endswith('.py')),
        'md_files': sum(1 for f in file_tree if f.endswith('.md')),
        'test_files': sum(1 for f in file_tree if 'test' in f.lower() or 'spec' in f.lower()),
        'config_files': sum(1 for f in file_tree if 'config' in f.lower() or f.endswith('.json') or f.endswith('.toml') or f.endswith('.yaml')),
        'has_docker': 1 if any('dockerfile' in f.lower() for f in file_tree) else 0,
        'has_ci': 1 if any('.github/workflows' in f.lower() or '.gitlab-ci' in f.lower() for f in file_tree) else 0,
        'max_depth': max([len(f.split('/')) for f in file_tree] + [0]),
    }
    # Derived features
    features['test_ratio'] = features['test_files'] / features['total_files'] if features['total_files'] > 0 else 0
    features['doc_ratio'] = features['md_files'] / features['total_files'] if features['total_files'] > 0 else 0
    return features


# Generate some synthetic training data for our model
def generate_synthetic_data(num_samples=200):
    data = []
    for _ in range(num_samples):
        # Random feature simulation
        total_files = np.random.randint(10, 500)
        test_ratio = np.random.uniform(0, 0.4)
        doc_ratio = np.random.uniform(0, 0.2)
        has_ci = np.random.choice([0, 1], p=[0.4, 0.6])
        has_docker = np.random.choice([0, 1], p=[0.5, 0.5])
        js_ts_files = int(total_files * np.random.uniform(0.1, 0.8))
        config_files = np.random.randint(2, 10)
        max_depth = np.random.randint(2, 8)
        
        # Calculate scores realistically
        code_quality = 40 + (test_ratio * 100) + (has_ci * 10) - (max_depth * 2)
        security = 50 + (has_docker * 10) + (has_ci * 15)
        documentation = 30 + (doc_ratio * 300)
        maintainability = 60 + (test_ratio * 50) + (doc_ratio * 100) - (max_depth * 3)
        dependencies = 50 + (config_files * 3)
        test_coverage = test_ratio * 250
        
        # Cap at 100
        scores = {k: min(100, max(10, v)) for k, v in {
            'codeQuality': code_quality,
            'security': security,
            'documentation': documentation,
            'maintainability': maintainability,
            'dependencies': dependencies,
            'testCoverage': test_coverage
        }.items()}
        
        # Calculate overall as average
        scores['overall'] = sum(scores.values()) / len(scores)

        features = {
            'total_files': total_files,
            'js_ts_files': js_ts_files,
            'py_files': 0,
            'md_files': int(total_files * doc_ratio),
            'test_files': int(total_files * test_ratio),
            'config_files': config_files,
            'has_docker': has_docker,
            'has_ci': has_ci,
            'max_depth': max_depth,
            'test_ratio': test_ratio,
            'doc_ratio': doc_ratio,
        }
        
        data.append(list(features.values()) + list(scores.values()))
        
    return data

# Global models dictionary
models = {}
feature_cols = [
    'total_files', 'js_ts_files', 'py_files', 'md_files', 'test_files',
    'config_files', 'has_docker', 'has_ci', 'max_depth', 'test_ratio', 'doc_ratio'
]
target_cols = ['overall', 'codeQuality', 'security', 'documentation', 'maintainability', 'dependencies', 'testCoverage']

def train_models():
    """Trains the regression models on the synthetic dataset."""
    print("Training ML models...")
    data = generate_synthetic_data(500)
    
    # Extract feature values based on the order in extract_features
    # We'll just separate X and Y directly by columns
    # features has 11 keys, scores has 7 keys
    X = [row[:11] for row in data]
    Y = [row[11:] for row in data]
    
    for idx, target in enumerate(target_cols):
        y = [row[idx] for row in Y]
        model = make_pipeline(StandardScaler(), RandomForestRegressor(n_estimators=50, random_state=42))
        model.fit(X, y)
        models[target] = model
        
    print("ML models trained successfully.")

def predict_scores(file_tree: list[str]) -> dict:
    """Uses the trained models to predict scores for a new repository file tree."""
    if not models:
        train_models()
        
    # Only extract the exact feature values in the exact array sequence matching training layout
    features = extract_features(file_tree)
    X_new = [list(features.values())]
    
    predictions = {}
    for target, model in models.items():
        pred_value = model.predict(X_new)[0]
        predictions[target] = int(min(100, max(0, pred_value))) # Clamp to 0-100
        
    return predictions
