import random

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
        total_files = random.randint(10, 500)
        test_ratio = random.uniform(0, 0.4)
        doc_ratio = random.uniform(0, 0.2)
        has_ci = random.choice([0, 1])
        has_docker = random.choice([0, 1])
        js_ts_files = int(total_files * random.uniform(0.1, 0.8))
        config_files = random.randint(2, 10)
        max_depth = random.randint(2, 8)
        
        # Calculate scores realistically
        code_quality = 40 + (test_ratio * 100) + (has_ci * 10) - (max_depth * 2)
        security = 50 + (has_docker * 10) + (has_ci * 15)
        documentation = 30 + (doc_ratio * 300)
        maintainability = 60 + (test_ratio * 50) + (doc_ratio * 100) - (max_depth * 3)
        dependencies = 50 + (config_files * 3)
        test_coverage = test_ratio * 250
        
        # Cap at 100
        raw_scores = {
            'codeQuality': code_quality,
            'security': security,
            'documentation': documentation,
            'maintainability': maintainability,
            'dependencies': dependencies,
            'testCoverage': test_coverage
        }
        
        scores = {k: min(100, max(10, v)) for k, v in raw_scores.items()}
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

class StandardScaler:
    def __init__(self):
        self.means = []
        self.stds = []
        
    def fit_transform(self, X):
        n_samples = len(X)
        n_features = len(X[0])
        self.means = [sum(x[j] for x in X) / n_samples for j in range(n_features)]
        
        self.stds = []
        for j in range(n_features):
            variance = sum((x[j] - self.means[j]) ** 2 for x in X) / n_samples
            self.stds.append((variance ** 0.5) if variance > 0 else 1.0)
            
        return self.transform(X)
        
    def transform(self, X):
        return [[(x[j] - self.means[j]) / self.stds[j] for j in range(len(x))] for x in X]

class PurePythonLinearRegressor:
    """A native Machine Learning model trained exclusively from scratch using Gradient Descent!"""
    def __init__(self, learning_rate=0.1, epochs=500):
        self.lr = learning_rate
        self.epochs = epochs
        self.weights = []
        self.bias = 0.0
        
    def fit(self, X, y):
        n_samples = len(X)
        n_features = len(X[0])
        self.weights = [0.0] * n_features
        
        for _ in range(self.epochs):
            y_predicted = self.predict(X)
            
            dw = [0.0] * n_features
            db = 0.0
            
            for i in range(n_samples):
                error = y_predicted[i] - y[i]
                db += error
                for j in range(n_features):
                    dw[j] += error * X[i][j]
                    
            for j in range(n_features):
                self.weights[j] -= (self.lr / n_samples) * dw[j]
            self.bias -= (self.lr / n_samples) * db
            
    def predict(self, X):
        predictions = []
        for x in X:
            pred = self.bias + sum(self.weights[j] * x[j] for j in range(len(x)))
            predictions.append(pred)
        return predictions

class MLPipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = PurePythonLinearRegressor()
        
    def fit(self, X, y):
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        
    def predict(self, X):
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

# Global models dictionary
models = {}
feature_cols = [
    'total_files', 'js_ts_files', 'py_files', 'md_files', 'test_files',
    'config_files', 'has_docker', 'has_ci', 'max_depth', 'test_ratio', 'doc_ratio'
]
target_cols = ['codeQuality', 'security', 'documentation', 'maintainability', 'dependencies', 'testCoverage', 'overall']

def train_models():
    """Trains Custom Native ML Models natively from scratch via Gradient Descent on the synthetic dataset."""
    print("Training Custom ML models via Gradient Descent...")
    data = generate_synthetic_data(500)
    
    # 11 features
    X = [row[:11] for row in data]
    Y = [row[11:] for row in data]
    
    for idx, target in enumerate(target_cols):
        y = [row[idx] for row in Y]
        model = MLPipeline()
        model.fit(X, y)
        models[target] = model
        
    print("Custom Built Native ML models trained successfully!")

def predict_scores(file_tree: list[str]) -> dict:
    """Uses the custom trained Gradient-Descent model to predict scores for a new repository file tree."""
    if not models:
        train_models()
        
    features = extract_features(file_tree)
    X_new = [list(features.values())]
    
    predictions = {}
    for target, model in models.items():
        pred_value = model.predict(X_new)[0]
        predictions[target] = int(min(100, max(0, pred_value))) # Clamp to 0-100
        
    return predictions
